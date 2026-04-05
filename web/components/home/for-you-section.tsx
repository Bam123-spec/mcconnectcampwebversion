"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatEventDateLabel } from "@/lib/live-data";

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

type RegistrationRow = {
  id: string;
  event?:
    | {
        id?: string | null;
        name?: string | null;
        date?: string | null;
        day?: string | null;
        time?: string | null;
        location?: string | null;
      }
    | {
        id?: string | null;
        name?: string | null;
        date?: string | null;
        day?: string | null;
        time?: string | null;
        location?: string | null;
      }[]
    | null;
};

type RecommendedEventRow = {
  id: string;
  name?: string | null;
  date?: string | null;
  day?: string | null;
  time?: string | null;
  location?: string | null;
  club_id?: string | null;
};

type ForYouCard = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  badge: string;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export function ForYouSection() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [cards, setCards] = useState<ForYouCard[]>([]);
  const [joinedClubCount, setJoinedClubCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadForYou = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setCards([]);
          setJoinedClubCount(0);
          setLoading(false);
        }
        return;
      }

      const membershipsResult = await supabase
        .from("club_members")
        .select("club_id, clubs(name)")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .limit(8);

      const registrationsResult = await supabase
        .from("event_registrations")
        .select("id, event:events(id, name, date, day, time, location)")
        .eq("user_id", user.id)
        .order("id", { ascending: false })
        .limit(4);

      const memberships = (membershipsResult.data ?? []) as MembershipRow[];
      const registrations = (registrationsResult.data ?? []) as RegistrationRow[];
      const clubIds = memberships.map((membership) => membership.club_id).filter(Boolean);
      const clubNameMap = new Map<string, string>();

      for (const membership of memberships) {
        const club = firstItem(membership.clubs);
        if (membership.club_id && club?.name) {
          clubNameMap.set(membership.club_id, club.name);
        }
      }

      const registeredEventIds = new Set<string>();
      const registeredCards: ForYouCard[] = registrations
        .map((registration) => {
          const event = firstItem(registration.event);
          if (!event?.id || !event.name) return null;
          registeredEventIds.add(event.id);
          return {
            id: `registered-${registration.id}`,
            title: event.name,
            detail: formatEventDateLabel(event.date || event.day || null, event.time),
            meta: event.location || "Location TBA",
            badge: "You're registered",
          };
        })
        .filter(Boolean) as ForYouCard[];

      let recommendedCards: ForYouCard[] = [];

      if (clubIds.length) {
        const { data: recommendedEvents } = await supabase
          .from("events")
          .select("id, name, date, day, time, location, club_id")
          .in("club_id", clubIds)
          .order("date", { ascending: true, nullsFirst: false })
          .order("day", { ascending: true, nullsFirst: false })
          .limit(8);

        recommendedCards = ((recommendedEvents ?? []) as RecommendedEventRow[])
          .filter((event) => event.id && !registeredEventIds.has(event.id))
          .slice(0, 4)
          .map((event) => ({
            id: `recommended-${event.id}`,
            title: event.name || "Club event",
            detail: formatEventDateLabel(event.date || event.day || null, event.time),
            meta: clubNameMap.get(event.club_id || "") || event.location || "Montgomery College",
            badge: event.club_id && clubNameMap.has(event.club_id) ? "From your club" : "Recommended",
          }));
      }

      const fallbackCards =
        registeredCards.length || recommendedCards.length
          ? []
          : [
              {
                id: "fallback-discover",
                title: "Discover new events this week",
                detail: "Browse upcoming campus programs and open RSVPs.",
                meta: "Explore clubs and events across Montgomery College",
                badge: "Recommended",
              },
            ];

      if (!cancelled) {
        setSignedIn(true);
        setJoinedClubCount(clubIds.length);
        setCards([...registeredCards, ...recommendedCards].slice(0, 6).concat(fallbackCards).slice(0, 6));
        setLoading(false);
      }
    };

    loadForYou();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadForYou();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">For You</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Personalized picks from your campus activity</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {signedIn
              ? joinedClubCount
                ? `Based on ${joinedClubCount} club${joinedClubCount === 1 ? "" : "s"} you joined and the events you already saved or registered for.`
                : "Based on the events you have registered for and what is happening around Montgomery College."
              : "Sign in to see registered events and recommendations from the communities you follow."}
          </p>
        </div>
        <Link href="/activity" className="text-sm font-semibold text-[#51237f] hover:underline">
          View activity
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
          <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
          Loading your personalized campus feed.
        </div>
      ) : (
        <div className="mt-6 -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="min-w-[280px] max-w-[320px] flex-1 rounded-xl border border-gray-200 bg-[#fafafa] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#ede7f6] px-3 py-1 text-[11px] font-semibold text-[#51237f]">
                  {card.badge}
                </span>
                <CalendarDays size={16} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold leading-tight text-gray-900">{card.title}</h3>
              <p className="mt-3 text-sm font-medium text-gray-700">{card.detail}</p>
              <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Users size={13} className="text-gray-400" />
                {card.meta}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
