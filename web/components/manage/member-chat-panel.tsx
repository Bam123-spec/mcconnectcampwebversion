"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getClubPath } from "@/lib/club-utils";
import { formatOfficerRole, getClubColor, getClubInitials } from "@/lib/live-data";

type OfficerRow = {
  club_id: string;
  role?: string | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

type RoomRow = {
  id: string;
  club_id?: string | null;
  name?: string | null;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export function MemberChatPanel() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [rooms, setRooms] = useState<
    Array<{ roomId: string; clubId: string; clubName: string; roleLabel: string; initials: string; color: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setRooms([]);
          setLoading(false);
        }
        return;
      }

      const { data: officerRows } = await supabase
        .from("officers")
        .select("club_id, role, clubs(name)")
        .eq("user_id", user.id)
        .limit(10);

      const officerClubs = ((officerRows ?? []) as OfficerRow[])
        .map((row) => {
          const club = firstItem(row.clubs);
          if (!row.club_id || !club?.name) return null;
          return {
            clubId: row.club_id,
            clubName: club.name,
            roleLabel: formatOfficerRole(row.role),
            initials: getClubInitials(club.name),
            color: getClubColor(row.club_id),
          };
        })
        .filter(Boolean) as Array<{ clubId: string; clubName: string; roleLabel: string; initials: string; color: string }>;

      const clubIds = officerClubs.map((club) => club.clubId);
      let roomMap = new Map<string, string>();

      if (clubIds.length) {
        const { data: roomRows } = await supabase
          .from("chat_rooms")
          .select("id, club_id, name")
          .eq("type", "group")
          .in("club_id", clubIds);

        roomMap = new Map(
          ((roomRows ?? []) as RoomRow[])
            .filter((row) => row.club_id && row.id)
            .map((row) => [row.club_id as string, row.id])
        );
      }

      const mapped = officerClubs.map((club) => ({
        roomId: roomMap.get(club.clubId) || "",
        ...club,
      }));

      if (!cancelled) {
        setSignedIn(true);
        setRooms(mapped);
        setLoading(false);
      }
    };

    loadRooms();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[24px] border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
        Loading member chats.
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">Open member chat after sign in</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Sign in to access the member-facing chat rooms for clubs you manage.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Member Chat</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">Talk directly with your club members</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Open the live club chat for the communities you lead and keep member conversations moving without leaving the officer workspace.
        </p>
      </section>

      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {rooms.length ? (
            rooms.map((club) => (
              <div
                key={club.clubId}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white ${club.color}`}
                  >
                    {club.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-gray-950">{club.clubName}</p>
                    <p className="mt-1 text-sm text-gray-600">{club.roleLabel} · Member chat</p>
                  </div>
                </div>
                {club.roomId ? (
                  <Link
                    href={`/manage/chats/members/${club.roomId}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#51237f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#45206b]"
                  >
                    <MessageSquare size={15} />
                    Open Chat
                  </Link>
                ) : (
                  <Link
                    href={getClubPath(club.clubId)}
                    className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                  >
                    Open Club
                  </Link>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-6 text-sm text-gray-600">
              No managed club chats are available yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
