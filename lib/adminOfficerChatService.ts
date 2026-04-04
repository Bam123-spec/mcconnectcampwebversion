import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AdminConversation, AdminMessage, Profile } from "@/types/database";

const getConversationTitle = (conversation: any) =>
  conversation.subject ||
  conversation.clubs?.name ||
  (conversation.type === "club" ? "Leadership Channel" : "Admin Conversation");

const isRpcUnavailable = (error: any) => {
  const message = `${error?.message || ""} ${error?.details || ""}`;
  return error?.code === "PGRST202" || /function .* does not exist|could not find the function/i.test(message);
};

const isAdminProvisioningRestriction = (error: any) =>
  error?.code === "P0001" &&
  /only admins can provision club conversations/i.test(`${error?.message || ""}`);

async function hydrateAdminMessages(messages: AdminMessage[]) {
  const senderIds = [...new Set(messages.map((message) => message.sender_id).filter(Boolean))];

  if (senderIds.length === 0) {
    return messages;
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", senderIds);

  if (error) {
    throw error;
  }

  const profileMap = new Map<string, Profile>(
    (profiles || []).map((profile) => [profile.id, profile as Profile])
  );

  return messages.map((message) => ({
    ...message,
    sender: profileMap.get(message.sender_id) || null,
  }));
}

async function assertAdminConversationAccess(conversationId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase.rpc("is_admin_conversation_member", {
    target_conversation_id: conversationId,
  });

  if (error) {
    if (!isRpcUnavailable(error)) {
      throw error;
    }

    const [{ data: membership, error: membershipError }, { data: profile, error: profileError }] =
      await Promise.all([
        supabase
          .from("admin_conversation_members")
          .select("id")
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

    if (membershipError) {
      throw membershipError;
    }

    if (profileError) {
      throw profileError;
    }

    if (!membership?.id && profile?.role !== "admin") {
      throw new Error("You do not have access to this leadership conversation.");
    }

    return;
  }

  if (!data) {
    throw new Error("You do not have access to this leadership conversation.");
  }
}

export async function syncAdminOfficerConversations() {
  await Promise.allSettled([
    supabase.rpc("sync_admin_club_conversations", {}),
    supabase.rpc("sync_admin_club_chat_paths", {}),
  ]);
}

export async function getAdminOfficerConversations(clubId?: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  await syncAdminOfficerConversations();

  let memberQuery = supabase
    .from("admin_conversation_members")
    .select("conversation_id, role")
    .eq("user_id", user.id);

  const { data: memberships, error: memberError } = await memberQuery;

  if (memberError) {
    throw memberError;
  }

  if (!memberships?.length) {
    return [] as AdminConversation[];
  }

  const membershipMap = new Map(
    memberships.map((membership) => [membership.conversation_id, membership])
  );

  let conversationsQuery = supabase
    .from("admin_conversations")
    .select(`
      *,
      clubs:club_id (
        id,
        name,
        cover_image_url
      )
    `)
    .in(
      "id",
      memberships.map((membership) => membership.conversation_id)
    )
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (clubId) {
    conversationsQuery = conversationsQuery.eq("club_id", clubId);
  }

  const { data: conversations, error: conversationsError } = await conversationsQuery;

  if (conversationsError) {
    throw conversationsError;
  }

  const conversationIds = conversations?.map((conversation) => conversation.id) || [];

  const [readsResult, lastMessagesResult] = await Promise.all([
    supabase
      .from("admin_message_reads")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id)
      .in("conversation_id", conversationIds),
    Promise.all(
      conversationIds.map(async (conversationId) => {
        const { data } = await supabase
          .from("admin_messages")
          .select("conversation_id, body, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return data;
      })
    ),
  ]);

  const readMap = new Map(
    (readsResult.data || []).map((item) => [item.conversation_id, item.last_read_at])
  );

  const lastMessageMap = new Map(
    lastMessagesResult
      .filter(Boolean)
      .map((message: any) => [message.conversation_id, message])
  );

  const unreadCounts = await Promise.all(
    (conversations || []).map(async (conversation) => {
      const lastReadAt = readMap.get(conversation.id);

      let query = supabase
        .from("admin_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", user.id);

      if (lastReadAt) {
        query = query.gt("created_at", lastReadAt);
      }

      const { count } = await query;
      return [conversation.id, count || 0] as const;
    })
  );

  const unreadMap = new Map(unreadCounts);

  return (conversations || []).map((conversation: any) => ({
    ...conversation,
    club: conversation.clubs || null,
    subject: getConversationTitle(conversation),
    member_role: membershipMap.get(conversation.id)?.role || null,
    last_message: lastMessageMap.get(conversation.id)?.body || "No messages yet",
    unread_count: unreadMap.get(conversation.id) || 0,
  })) as AdminConversation[];
}

export async function ensureAdminOfficerConversation(clubId: string) {
  try {
    const { data, error } = await supabase.rpc("ensure_admin_club_conversation", {
      target_club_id: clubId,
    });

    if (error) {
      throw error;
    }

    if (typeof data === "string") {
      return data;
    }

    if (data?.id) {
      return data.id as string;
    }
  } catch (error) {
    if (!isRpcUnavailable(error) && !isAdminProvisioningRestriction(error)) {
      throw error;
    }
  }

  const conversations = await getAdminOfficerConversations(clubId);
  return conversations[0]?.id;
}

export async function getAdminOfficerMessages(conversationId: string) {
  await assertAdminConversationAccess(conversationId);

  const { data, error } = await supabase
    .from("admin_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return hydrateAdminMessages((data || []) as AdminMessage[]);
}

export async function getAdminOfficerConversation(conversationId: string) {
  await assertAdminConversationAccess(conversationId);

  const { data, error } = await supabase
    .from("admin_conversations")
    .select(`
      *,
      clubs:club_id (
        id,
        name,
        cover_image_url
      )
    `)
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    club: data.clubs || null,
    subject: getConversationTitle(data),
  } as AdminConversation;
}

export async function markAdminConversationRead(conversationId: string) {
  try {
    await assertAdminConversationAccess(conversationId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data: conversation } = await supabase
      .from("admin_conversations")
      .select("id, org_id")
      .eq("id", conversationId)
      .maybeSingle();

    if (!conversation) {
      return;
    }

    const { data: existing } = await supabase
      .from("admin_message_reads")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("admin_message_reads")
        .update({ last_read_at: new Date().toISOString() })
        .eq("id", existing.id);
      return;
    }

    const { error } = await supabase.from("admin_message_reads").insert({
      conversation_id: conversationId,
      org_id: conversation.org_id,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("markAdminConversationRead insert skipped:", error);
    }
  } catch (error) {
    console.warn("markAdminConversationRead skipped:", error);
  }
}

export async function sendAdminOfficerMessage(
  conversationId: string,
  body: string,
  senderRole?: string | null
) {
  await assertAdminConversationAccess(conversationId);

  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error("Message cannot be empty");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [{ data: conversation, error: conversationError }, { data: membership }] =
    await Promise.all([
      supabase
        .from("admin_conversations")
        .select("id, org_id")
        .eq("id", conversationId)
        .single(),
      supabase
        .from("admin_conversation_members")
        .select("role")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  if (conversationError) {
    throw conversationError;
  }

  const { data, error } = await supabase
    .from("admin_messages")
    .insert({
      conversation_id: conversationId,
      org_id: conversation.org_id,
      sender_id: user.id,
      sender_role: senderRole || membership?.role || "officer",
      body: trimmedBody,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const [message] = await hydrateAdminMessages([data as AdminMessage]);

  await Promise.allSettled([
    supabase
      .from("admin_conversations")
      .update({
        updated_at: new Date().toISOString(),
        last_message_at: message.created_at,
      })
      .eq("id", conversationId),
    markAdminConversationRead(conversationId),
  ]);

  return message;
}

export function subscribeToAdminConversation(
  conversationId: string,
  onMessage: (message: AdminMessage) => void
) {
  const channel = supabase
    .channel(`admin-conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "admin_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const hydrated = await hydrateAdminMessages([payload.new as AdminMessage]);
        onMessage(hydrated[0]);
      }
    )
    .subscribe();

  return channel;
}

export async function getAdminConversationMembers(conversationId: string) {
  const { data, error } = await supabase
    .from("admin_conversation_members")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("joined_at", { ascending: true });

  if (error) {
    throw error;
  }

  const members = data || [];
  const userIds = [...new Set(members.map((member: any) => member.user_id).filter(Boolean))];

  if (userIds.length === 0) {
    return members;
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    throw profilesError;
  }

  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return members.map((member: any) => ({
    ...member,
    profile: profileMap.get(member.user_id) || null,
  }));
}

export type AdminConversationChannel = RealtimeChannel;
