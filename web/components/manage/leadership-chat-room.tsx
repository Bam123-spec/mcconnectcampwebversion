"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type MessageRow = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type HydratedMessage = MessageRow & {
  senderName: string;
  isOwn: boolean;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

async function hydrateAdminMessages(messages: MessageRow[], currentUserId: string) {
  const senderIds = [...new Set(messages.map((message) => message.sender_id).filter(Boolean))];
  if (!senderIds.length) return [];

  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", senderIds);
  const profileMap = new Map(
    (profiles ?? []).map((profile: { id: string; full_name?: string | null }) => [
      profile.id,
      profile.full_name || "Leadership",
    ])
  );

  return messages.map((message) => ({
    ...message,
    senderName: profileMap.get(message.sender_id) || "Leadership",
    isOwn: message.sender_id === currentUserId,
  }));
}

export function LeadershipChatRoom({ conversationId }: { conversationId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Leadership Channel");
  const [messages, setMessages] = useState<HydratedMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [senderRole, setSenderRole] = useState<"admin" | "club">("club");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    const loadConversation = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setError("Sign in to open this leadership channel.");
          setLoading(false);
        }
        return;
      }

      setUserId(user.id);

      const [{ data: membership }, { data: profile }, { data: conversation, error: conversationError }] =
        await Promise.all([
          supabase
            .from("admin_conversation_members")
            .select("conversation_id")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
          supabase
            .from("admin_conversations")
            .select("id, subject, type, clubs:club_id(name)")
            .eq("id", conversationId)
            .maybeSingle(),
        ]);

      if (conversationError || !conversation || (!membership?.conversation_id && profile?.role !== "admin")) {
        if (!cancelled) {
          setError("You do not have access to this leadership conversation.");
          setLoading(false);
        }
        return;
      }

      const resolvedTitle =
        conversation.subject ||
        firstItem(conversation.clubs)?.name ||
        (conversation.type === "club" ? "Leadership Channel" : "Leadership Conversation");

      const { data: messageRows, error: messageError } = await supabase
        .from("admin_messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (messageError) {
        if (!cancelled) {
          setError(messageError.message || "Failed to load leadership messages.");
          setLoading(false);
        }
        return;
      }

      const hydrated = await hydrateAdminMessages((messageRows ?? []) as MessageRow[], user.id);

      if (!cancelled) {
        setTitle(resolvedTitle);
        setSenderRole(profile?.role === "admin" ? "admin" : "club");
        setMessages(hydrated);
        setLoading(false);
      }

      channel = supabase
        .channel(`leadership-room-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "admin_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          async (payload) => {
            const incoming = payload.new as MessageRow;
            const hydratedIncoming = await hydrateAdminMessages([incoming], user.id);
            if (!cancelled && hydratedIncoming[0]) {
              setMessages((current) => {
                if (current.some((message) => message.id === incoming.id)) {
                  return current;
                }
                return [...current, hydratedIncoming[0]];
              });
            }
          }
        )
        .subscribe();
    };

    loadConversation();

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId]);

  const orderedMessages = useMemo(
    () =>
      [...messages].sort(
        (left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
      ),
    [messages]
  );

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim() || !userId) return;

    setSending(true);
    const messageBody = draft.trim();
    setDraft("");

    const { error: insertError } = await supabase.from("admin_messages").insert([
      {
        conversation_id: conversationId,
        sender_id: userId,
        sender_role: senderRole,
        body: messageBody,
      },
    ]);

    if (insertError) {
      setDraft(messageBody);
      setError(insertError.message || "Failed to send message.");
    } else {
      setError(null);
    }

    setSending(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Leadership Channel</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-gray-600">
          Keep leadership coordination separate from member chat so planning, approvals, and follow-up stay focused.
        </p>
      </section>

      <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        {loading ? (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
            Loading leadership messages.
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
              {orderedMessages.length ? (
                orderedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.isOwn
                        ? "ml-auto bg-[#51237f] text-white"
                        : "border border-gray-200 bg-[#fafafa] text-gray-900"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${message.isOwn ? "text-white/80" : "text-gray-500"}`}>
                      {message.senderName}
                    </p>
                    <p className="mt-1 text-sm leading-6">{message.body}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fafafa] px-5 py-6 text-sm text-gray-600">
                  No leadership messages yet. Start the private coordination here.
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="mt-5 flex gap-3">
              <label htmlFor="leadership-chat-draft" className="sr-only">
                Message leadership channel
              </label>
              <input
                id="leadership-chat-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write to leadership..."
                aria-label="Message leadership channel"
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                aria-label={sending ? "Sending message to leadership" : "Send message to leadership"}
                className="inline-flex items-center gap-2 rounded-full bg-[#51237f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45206b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={15} />
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        )}
      </section>

      <Link
        href="/manage/chats/leadership"
        className="inline-flex items-center text-sm font-semibold text-[#51237f] hover:underline"
      >
        Back to leadership channels
      </Link>
    </div>
  );
}
