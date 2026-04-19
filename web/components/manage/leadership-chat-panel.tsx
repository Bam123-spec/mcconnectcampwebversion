"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, MessagesSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MembershipRow = {
  conversation_id: string;
  role?: string | null;
};

type ConversationRow = {
  id: string;
  subject?: string | null;
  club_id?: string | null;
  type?: string | null;
  last_message_at?: string | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export function LeadershipChatPanel() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [conversations, setConversations] = useState<
    Array<{ id: string; title: string; roleLabel: string; updatedLabel: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setConversations([]);
          setLoading(false);
        }
        return;
      }

      const { data: memberships } = await supabase
        .from("admin_conversation_members")
        .select("conversation_id, role")
        .eq("user_id", user.id);

      const membershipRows = (memberships ?? []) as MembershipRow[];
      const conversationIds = membershipRows.map((membership) => membership.conversation_id).filter(Boolean);

      if (!conversationIds.length) {
        if (!cancelled) {
          setSignedIn(true);
          setConversations([]);
          setLoading(false);
        }
        return;
      }

      const membershipMap = new Map(membershipRows.map((membership) => [membership.conversation_id, membership.role || "club"]));
      const { data: conversationRows } = await supabase
        .from("admin_conversations")
        .select("id, subject, club_id, type, last_message_at, clubs:club_id(name)")
        .in("id", conversationIds)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      const mapped = ((conversationRows ?? []) as ConversationRow[]).map((conversation) => {
        const club = firstItem(conversation.clubs);
        const title =
          conversation.subject ||
          club?.name ||
          (conversation.type === "club" ? "Leadership Channel" : "Leadership Conversation");

        return {
          id: conversation.id,
          title,
          roleLabel: membershipMap.get(conversation.id) === "admin" ? "Admin" : "Leadership",
          updatedLabel: conversation.last_message_at
            ? new Date(conversation.last_message_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Recently updated",
        };
      });

      if (!cancelled) {
        setSignedIn(true);
        setConversations(mapped);
        setLoading(false);
      }
    };

    loadConversations();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[24px] border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
        Loading leadership channels.
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">Leadership channels start after sign in</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Sign in to access the private leadership conversations connected to your club roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Leadership Channel</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">
          Private coordination for officers and leadership
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Use this separate channel for leadership-only coordination, approvals, and follow-up away from the member-facing chat.
        </p>
      </section>

      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {conversations.length ? (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/manage/chats/leadership/${conversation.id}`}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 transition hover:border-[#d7cae8] hover:bg-[#faf8fd]"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-gray-950">{conversation.title}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {conversation.roleLabel} · Updated {conversation.updatedLabel}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#51237f] px-4 py-2 text-sm font-semibold text-white">
                  <MessagesSquare size={15} />
                  Open
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-6 text-sm text-gray-600">
              No leadership conversations are available yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
