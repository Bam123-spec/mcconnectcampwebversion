"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatEventDateLabel } from "@/lib/live-data";
import { getClubPath } from "@/lib/club-utils";

type MembershipRow = {
  club_id: string;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

type ClubEventRow = {
  id: string;
  name?: string | null;
  date?: string | null;
  day?: string | null;
  time?: string | null;
  club_id?: string | null;
};

type FeedItem = {
  id: string;
  clubId: string;
  clubName: string;
  eventTitle: string;
  eventDate: string;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export function FromYourClubsSection() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setItems([]);
          setLoading(false);
        }
        return;
      }

      const { data: memberships } = await supabase
        .from("club_members")
        .select("club_id, clubs(name)")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .limit(10);

      const membershipRows = (memberships ?? []) as MembershipRow[];
      const clubIds = membershipRows.map((row) => row.club_id).filter(Boolean);

      if (!clubIds.length) {
        if (!cancelled) {
          setSignedIn(true);
          setItems([]);
          setLoading(false);
        }
        return;
      }

      const clubNameMap = new Map<string, string>();
      for (const row of membershipRows) {
        const club = firstItem(row.clubs);
        if (row.club_id && club?.name) {
          clubNameMap.set(row.club_id, club.name);
        }
      }

      const { data: clubEvents } = await supabase
        .from("events")
        .select("id, name, date, day, time, club_id")
        .in("club_id", clubIds)
        .order("date", { ascending: true, nullsFirst: false })
        .order("day", { ascending: true, nullsFirst: false })
        .limit(6);

      const feedItems = ((clubEvents ?? []) as ClubEventRow[])
        .filter((event) => event.id && event.club_id && clubNameMap.has(event.club_id))
        .map((event) => ({
          id: event.id,
          clubId: event.club_id as string,
          clubName: clubNameMap.get(event.club_id as string) || "Your club",
          eventTitle: event.name || "New club event",
          eventDate: formatEventDateLabel(event.date || event.day || null, event.time),
        }));

      if (!cancelled) {
        setSignedIn(true);
        setItems(feedItems);
        setLoading(false);
      }
    };

    loadFeed();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadFeed();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section aria-labelledby="from-your-clubs-heading" aria-busy={loading} className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">
            From Your Clubs
          </p>
          <h2 id="from-your-clubs-heading" className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950">
            New activity from the communities you joined
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            See when your clubs post something new without digging through the full event list.
          </p>
        </div>
        <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
          View your clubs
        </Link>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="mt-6 flex items-center gap-3 text-sm text-gray-500">
          <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
          Loading activity from your clubs.
        </div>
      ) : items.length ? (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#faf8fd_100%)] px-5 py-4 shadow-[0_12px_35px_-30px_rgba(17,24,39,0.35)] md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600">
                  <Link href={getClubPath(item.clubId)} className="font-semibold text-[#51237f] hover:underline">
                    {item.clubName}
                  </Link>{" "}
                  posted a new event
                </p>
                <p className="mt-1 text-xl font-bold leading-tight tracking-[-0.02em] text-gray-950">
                  {item.eventTitle}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                  <CalendarDays size={15} className="text-gray-400" />
                  {item.eventDate}
                </p>
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 md:self-center"
              >
                View event
                <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-[#fafafa] px-5 py-6 text-sm text-gray-600">
          {signedIn
            ? "Join a club or wait for your communities to post new events. Activity from your groups will show up here."
            : "Sign in to see new events posted by the clubs you joined."}
        </div>
      )}
    </section>
  );
}
