"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ProfileRow = {
  id: string;
  full_name?: string | null;
};

type MessageRow = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type HydratedMessage = MessageRow & {
  senderName: string;
  isOwn: boolean;
};

async function hydrateMessages(messages: MessageRow[], currentUserId: string) {
  const senderIds = [...new Set(messages.map((message) => message.sender_id).filter(Boolean))];
  if (!senderIds.length) return [];

  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", senderIds);
  const profileMap = new Map((profiles ?? []).map((profile: ProfileRow) => [profile.id, profile.full_name || "Member"]));

  return messages.map((message) => ({
    ...message,
    senderName: profileMap.get(message.sender_id) || "Member",
    isOwn: message.sender_id === currentUserId,
  }));
}

export function MemberChatRoom({ roomId }: { roomId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("Club Chat");
  const [messages, setMessages] = useState<HydratedMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    const loadRoom = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setError("Sign in to open this club chat.");
          setLoading(false);
        }
        return;
      }

      setUserId(user.id);

      const { data: room, error: roomError } = await supabase
        .from("chat_rooms")
        .select("id, name, club_id")
        .eq("id", roomId)
        .maybeSingle();

      if (roomError || !room) {
        if (!cancelled) {
          setError("This member chat could not be found.");
          setLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const { data: officerRow } = await supabase
        .from("officers")
        .select("club_id")
        .eq("user_id", user.id)
        .eq("club_id", room.club_id)
        .maybeSingle();

      if (profile?.role !== "admin" && !officerRow?.club_id) {
        if (!cancelled) {
          setError("You do not manage the club linked to this chat.");
          setLoading(false);
        }
        return;
      }

      await supabase.from("chat_members").upsert(
        { room_id: room.id, user_id: user.id },
        { onConflict: "room_id, user_id" }
      );

      const { data: messageRows, error: messageError } = await supabase
        .from("chat_messages")
        .select("id, sender_id, content, created_at")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (messageError) {
        if (!cancelled) {
          setError(messageError.message || "Failed to load chat messages.");
          setLoading(false);
        }
        return;
      }

      const hydrated = await hydrateMessages((messageRows ?? []) as MessageRow[], user.id);

      if (!cancelled) {
        setRoomName(room.name || "Club Chat");
        setMessages(hydrated);
        setLoading(false);
      }

      channel = supabase
        .channel(`member-room-${room.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `room_id=eq.${room.id}`,
          },
          async (payload) => {
            const incoming = payload.new as MessageRow;
            const hydratedIncoming = await hydrateMessages([incoming], user.id);
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

    loadRoom();

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomId]);

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

    const { error: insertError } = await supabase.from("chat_messages").insert([
      {
        room_id: roomId,
        sender_id: userId,
        content: messageBody,
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Member Chat</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">{roomName}</h1>
        <p className="mt-4 text-sm leading-7 text-gray-600">
          Stay present in the main club conversation and respond to members without leaving the officer workspace.
        </p>
      </section>

      <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        {loading ? (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
            Loading chat.
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
                    <p className="mt-1 text-sm leading-6">{message.content}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fafafa] px-5 py-6 text-sm text-gray-600">
                  No messages yet. Start the conversation for your members.
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="mt-5 flex gap-3">
              <label htmlFor="member-chat-draft" className="sr-only">
                Message club members
              </label>
              <input
                id="member-chat-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write to your club members..."
                aria-label="Message club members"
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                aria-label={sending ? "Sending message to club members" : "Send message to club members"}
                className="inline-flex items-center gap-2 rounded-full bg-[#51237f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45206b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={15} />
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        )}
      </section>

      <Link href="/manage/chats/members" className="inline-flex items-center text-sm font-semibold text-[#51237f] hover:underline">
        Back to member chats
      </Link>
    </div>
  );
}
