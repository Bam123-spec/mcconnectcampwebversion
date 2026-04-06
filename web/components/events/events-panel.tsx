"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Flame, Search } from "lucide-react";
import { EventCard, type WebEventCardEvent } from "@/components/events/EventCard";
import { getClientCache, setClientCache } from "@/lib/client-cache";
import { AUTH_ENABLED } from "@/lib/features";
import { supabase } from "@/lib/supabase";

type ViewMode = "for-you" | "all";
type FilterKey = "this-week" | "free" | "popular";

const VIEW_MODES: Array<{ key: ViewMode; label: string }> = [
  { key: "for-you", label: "For You" },
  { key: "all", label: "All Events" },
];

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "this-week", label: "This Week" },
  { key: "free", label: "Free" },
  { key: "popular", label: "Popular" },
];

const fallbackCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";

const parseEventDateTime = (dateValue?: string | null, timeValue?: string | null) => {
  if (!dateValue) return null;

  const datePart = dateValue.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;

  const eventDate = new Date(year, month - 1, day);

  if (!timeValue || timeValue === "TBA") {
    eventDate.setHours(23, 59, 59, 999);
    return eventDate;
  }

  const match = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    eventDate.setHours(23, 59, 59, 999);
    return eventDate;
  }

  const [, hourText, minuteText, meridiem] = match;
  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (meridiem.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;

  eventDate.setHours(hour, minute, 0, 0);
  return eventDate;
};

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const isFreeEvent = (event: WebEventCardEvent) => {
  const haystack = `${event.name} ${event.description}`.toLowerCase();
  const paidSignals = ["ticket", "tickets", "paid", "$", "fee", "cost"];
  return !paidSignals.some((signal) => haystack.includes(signal));
};

const getUrgencyLabel = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfEvent = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const dayDiff = Math.round((startOfEvent.getTime() - startOfToday.getTime()) / 86400000);

  if (dayDiff === 0) return "Today";
  if (dayDiff > 0 && dayDiff <= 3) return "Soon";
  return null;
};

export function EventsPanel({
  initialEvents,
  initialQuery = "",
}: {
  initialEvents: WebEventCardEvent[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [preferredClubNames, setPreferredClubNames] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<ViewMode>("for-you");
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRegistrationState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setHasSession(false);
          setRegisteredIds(new Set());
          setPreferredClubNames(new Set());
        }
        return;
      }

      const eventIds = initialEvents.map((event) => event.id);
      if (eventIds.length === 0) {
        if (!cancelled) {
          setHasSession(true);
          setRegisteredIds(new Set());
          setPreferredClubNames(new Set());
        }
        return;
      }
      const cacheKey = `events-state:${user.id}:${eventIds.join(",")}`;
      const cachedState = getClientCache<{
        registeredIds: string[];
        preferredClubNames: string[];
      }>(cacheKey);

      if (cachedState && !cancelled) {
        setHasSession(true);
        setRegisteredIds(new Set(cachedState.registeredIds));
        setPreferredClubNames(new Set(cachedState.preferredClubNames));
      }

      const [{ data, error }, membershipsResult, followersResult, interactionsResult] = await Promise.all([
        supabase
          .from("event_registrations")
          .select("event_id")
          .eq("user_id", user.id)
          .in("event_id", eventIds),
        supabase
          .from("club_members")
          .select("clubs(name)")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .limit(50),
        supabase
          .from("club_followers")
          .select("clubs(name)")
          .eq("user_id", user.id)
          .limit(50),
        supabase
          .from("event_registrations")
          .select("event:events(clubs(name))")
          .eq("user_id", user.id)
          .limit(50),
      ]);

      if (cancelled) return;

      if (error) {
        console.error("Error loading RSVP state:", error);
        setHasSession(true);
        setRegisteredIds(new Set());
        return;
      }

      setHasSession(true);
      const nextRegisteredIds = new Set((data ?? []).map((row) => row.event_id));
      setRegisteredIds(nextRegisteredIds);

      const nextPreferredNames = new Set<string>();

      for (const row of membershipsResult.data ?? []) {
        const club = Array.isArray(row.clubs) ? row.clubs[0] : row.clubs;
        if (club?.name?.trim()) nextPreferredNames.add(club.name.trim().toLowerCase());
      }

      for (const row of followersResult.data ?? []) {
        const club = Array.isArray(row.clubs) ? row.clubs[0] : row.clubs;
        if (club?.name?.trim()) nextPreferredNames.add(club.name.trim().toLowerCase());
      }

      for (const row of interactionsResult.data ?? []) {
        const event = Array.isArray(row.event) ? row.event[0] : row.event;
        const club = event?.clubs ? (Array.isArray(event.clubs) ? event.clubs[0] : event.clubs) : null;
        if (club?.name?.trim()) nextPreferredNames.add(club.name.trim().toLowerCase());
      }

      setClientCache(cacheKey, {
        registeredIds: [...nextRegisteredIds],
        preferredClubNames: [...nextPreferredNames],
      });
      setPreferredClubNames(nextPreferredNames);
    };

    loadRegistrationState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadRegistrationState();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [initialEvents]);

  const { filteredUpcomingEvents, pastEvents, popularThisWeek } = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const upcoming = initialEvents.filter((event) => {
      const parsed = parseEventDateTime(event.date, event.time);
      return parsed ? parsed >= now : false;
    });

    const past = initialEvents
      .filter((event) => {
        const parsed = parseEventDateTime(event.date, event.time) ?? parseLocalDate(event.date);
        return parsed ? parsed < now : false;
      })
      .reverse();

    const normalizedQuery = searchValue.trim().toLowerCase();

    const filtered = upcoming.filter((event) => {
      if (normalizedQuery) {
        const haystack = `${event.name} ${event.description} ${event.location} ${event.organizer_name ?? ""}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }

      if (activeFilter === "this-week") {
        const parsed = parseEventDateTime(event.date, event.time) ?? parseLocalDate(event.date);
        return parsed ? parsed <= weekFromNow : false;
      }

      if (activeFilter === "free") {
        return isFreeEvent(event);
      }

      if (activeFilter === "popular") {
        return (event.rsvp_count ?? 0) >= 10;
      }

      return true;
    });

    const sortedFiltered = [...filtered].sort((left, right) => {
      if (viewMode === "for-you") {
        const leftPreferred = preferredClubNames.has(left.organizer_name?.trim().toLowerCase() ?? "");
        const rightPreferred = preferredClubNames.has(right.organizer_name?.trim().toLowerCase() ?? "");

        if (leftPreferred !== rightPreferred) {
          return leftPreferred ? -1 : 1;
        }
      }

      if (activeFilter === "popular") {
        return (right.rsvp_count ?? 0) - (left.rsvp_count ?? 0);
      }

      const leftDate = parseEventDateTime(left.date, left.time) ?? parseLocalDate(left.date);
      const rightDate = parseEventDateTime(right.date, right.time) ?? parseLocalDate(right.date);

      return (leftDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (rightDate?.getTime() ?? Number.MAX_SAFE_INTEGER);
    });

    const weeklyPopular = [...upcoming]
      .filter((event) => {
        const parsed = parseEventDateTime(event.date, event.time) ?? parseLocalDate(event.date);
        return parsed ? parsed <= weekFromNow : false;
      })
      .sort((left, right) => (right.rsvp_count ?? 0) - (left.rsvp_count ?? 0))
      .slice(0, 3);

    return {
      filteredUpcomingEvents: sortedFiltered,
      pastEvents: past,
      popularThisWeek: weeklyPopular,
    };
  }, [activeFilter, initialEvents, preferredClubNames, searchValue, viewMode]);

  const handleToggleRsvp = async (eventId: string, isRegistered: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setActionError(null);
    setPendingIds((current) => new Set(current).add(eventId));

    try {
      if (isRegistered) {
        const { error } = await supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);

        if (error) throw error;

        setRegisteredIds((current) => {
          const next = new Set(current);
          next.delete(eventId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from("event_registrations")
          .insert([{ event_id: eventId, user_id: user.id }]);

        if (error) throw error;

        setRegisteredIds((current) => new Set(current).add(eventId));
      }
    } catch (error) {
      console.error("Error updating RSVP:", error);
      setActionError("We couldn't update your RSVP right now. Please try again.");
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(eventId);
        return next;
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Discover</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950 md:text-4xl">
                Events happening around campus
              </h1>
            </div>

            <form
              role="search"
              aria-label="Search events"
              onSubmit={(event) => event.preventDefault()}
              className="relative w-full max-w-md"
            >
              <Search
                aria-hidden="true"
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search events, clubs, or locations"
                className="h-12 w-full rounded-full border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
              />
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-gray-300 bg-gray-100 p-1">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setViewMode(mode.key)}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition ${
                    viewMode === mode.key
                      ? "bg-white text-[#51237f] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter((current) => (current === filter.key ? null : filter.key))}
                className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                  activeFilter === filter.key
                    ? "border-[#51237f] bg-[#51237f] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {actionError ? (
          <div className="mt-6 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </div>
        ) : null}
      </header>

      {popularThisWeek.length ? (
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-950">
              <Flame size={18} className="text-[#51237f]" />
              Popular This Week
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {popularThisWeek.map((event) => {
              const urgency = getUrgencyLabel(event.date);
              const isRegistered = registeredIds.has(event.id);
              const isPending = pendingIds.has(event.id);
              const parsedDate = new Date(event.date);
              const dateLabel = Number.isNaN(parsedDate.getTime())
                ? "Date to be announced"
                : parsedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });

              return (
                <article
                  key={`popular-${event.id}`}
                  className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_16px_34px_-26px_rgba(17,24,39,0.24)]"
                >
                  <div className="relative h-40 bg-gray-100">
                    <Image
                      src={event.cover_image_url || fallbackCover}
                      alt={event.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f] shadow-sm backdrop-blur-sm">
                        Popular
                      </span>
                      {urgency ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            urgency === "Today"
                              ? "bg-[#51237f]/92 text-white"
                              : "bg-amber-400/92 text-gray-950"
                          }`}
                        >
                          {urgency}
                        </span>
                      ) : null}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-sm font-medium text-white/85">{event.organizer_name || "Campus Event"}</p>
                      <h3 className="mt-2 text-xl font-bold leading-tight text-white">{event.name}</h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} className="text-gray-400" />
                        {dateLabel}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={15} className="text-gray-400" />
                        {(event.time || "TBA").split(" - ")[0]}
                      </span>
                    </div>

                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#51237f] text-[10px] font-bold text-white">
                          MC
                        </span>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#7a58a0] text-[10px] font-bold text-white">
                          ST
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {(event.rsvp_count ?? 0).toLocaleString()} going
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-sm text-gray-500">{event.location}</p>
                      {AUTH_ENABLED ? (
                        <button
                          type="button"
                          onClick={() => handleToggleRsvp(event.id, isRegistered)}
                          disabled={isPending}
                          className={`inline-flex shrink-0 items-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                            isRegistered
                              ? "border border-[#51237f] text-[#51237f] hover:bg-purple-50"
                              : "bg-[#51237f] text-white shadow-[0_12px_24px_-18px_rgba(81,35,127,0.7)] hover:bg-[#45206b]"
                          } ${isPending ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          {isPending ? "Updating..." : isRegistered ? "Registered" : "RSVP"}
                        </button>
                      ) : (
                        <Link
                          href="/login"
                          className="inline-flex shrink-0 items-center rounded-full bg-[#51237f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(81,35,127,0.7)] transition-colors hover:bg-[#45206b]"
                        >
                          Sign in
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-950">
            {viewMode === "for-you" ? "For You" : "All Events"}
            <span className="rounded-full border border-[#e7dcf3] bg-[#f4ecfb] px-3 py-1 text-sm font-bold text-[#51237f]">
              {filteredUpcomingEvents.length}
            </span>
          </h2>
        </div>

        {filteredUpcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredUpcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                authEnabled={AUTH_ENABLED}
                hasSession={hasSession}
                isRegistered={registeredIds.has(event.id)}
                isPending={pendingIds.has(event.id)}
                onToggleRsvp={handleToggleRsvp}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <h3 className="text-xl font-bold text-gray-900">No events match this view</h3>
            <p className="mt-2 text-sm text-gray-500">Try a different filter or search to explore more campus activity.</p>
          </div>
        )}
      </section>

      <section className="border-t border-gray-200 pt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-xl font-bold text-gray-500">
            Past Events
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-bold text-gray-400">
              {pastEvents.length}
            </span>
          </h2>
        </div>
        {pastEvents.length ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isPast
                authEnabled={AUTH_ENABLED}
                hasSession={hasSession}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500">
            Past events will show up here once more campus activity has been archived.
          </div>
        )}
      </section>
    </div>
  );
}
