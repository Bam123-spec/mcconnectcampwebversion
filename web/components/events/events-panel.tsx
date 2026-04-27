"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock, MapPin, Search, Users } from "lucide-react";
import { EventRsvpAction } from "@/components/events/event-rsvp-action";
import type { EventDetail } from "@/lib/events";

const FILTERS = ["All", "Today", "This Week", "Free", "Clubs"] as const;
type EventFilter = (typeof FILTERS)[number];

const INITIAL_VISIBLE = 9;
const LOAD_MORE_STEP = 9;

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const parseEventDate = (event: EventDetail) => {
  const directDate = parseLocalDate(event.date || undefined);
  if (directDate) return directDate;

  if (!event.day) return null;

  const guessed = new Date(`${new Date().getFullYear()} ${event.day}`);
  return Number.isNaN(guessed.getTime()) ? null : guessed;
};

const formatEventDate = (event: EventDetail) => {
  const parsed = parseEventDate(event);

  if (parsed) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  }

  return event.day || "Date to be announced";
};

const getDateParts = (event: EventDetail) => {
  const parsed = parseEventDate(event);

  if (!parsed) {
    return {
      month: "TBA",
      day: "--",
      weekday: "Date",
    };
  }

  return {
    month: parsed.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: parsed.toLocaleDateString("en-US", { day: "numeric" }),
    weekday: parsed.toLocaleDateString("en-US", { weekday: "short" }),
  };
};

const matchesSearch = (event: EventDetail, query: string) => {
  if (!query) return true;
  const haystack = [event.name, event.description, event.location, event.clubName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

const isThisWeek = (date: Date, now: Date) => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
};

const isTodayDate = (date: Date, now: Date) =>
  date.getFullYear() === now.getFullYear() &&
  date.getMonth() === now.getMonth() &&
  date.getDate() === now.getDate();

function EventCard({
  event,
  onRsvpChange,
}: {
  event: EventDetail;
  onRsvpChange: (payload: { eventId: string; isRegistered: boolean; registrationsCount: number }) => void;
}) {
  const eventDate = parseEventDate(event);
  const now = useMemo(() => new Date(), []);
  const dateParts = getDateParts(event);
  const attendeeCount = event.registrationsCount || event.audience_count || 0;
  const timingLabel = eventDate
    ? isTodayDate(eventDate, now)
      ? "Today"
      : isThisWeek(eventDate, now)
        ? "This week"
        : "Upcoming"
    : "Campus";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(15,23,42,0.07)]">
      <Link
        href={`/events/${event.id}`}
        className="relative block aspect-[16/9] overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
      >
        <Image
          src={
            event.cover_image_url ||
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop"
          }
          alt={event.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <div className="rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-700 shadow-sm">
            {dateParts.weekday} · {dateParts.month} {dateParts.day}
          </div>
          <div className="rounded-full border border-white/80 bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)] shadow-sm">
            {timingLabel}
          </div>
        </div>

        {event.isFree ? (
          <div className="absolute right-4 top-4 rounded-full border border-white/80 bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
            Free
          </div>
        ) : null}

        {typeof event.audience_count === "number" ? (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full border border-white/80 bg-white/95 px-3 py-1 text-[10px] font-semibold text-gray-700 shadow-sm">
            <Users size={12} /> {event.audience_count}
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
              {event.clubName || "Campus event"}
            </div>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-gray-950 transition-colors group-hover:text-[var(--primary)]">
              {event.name}
            </h3>
          </div>
          <div className="shrink-0 rounded-full border border-[var(--line-soft)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-gray-700">
            {attendeeCount} attending
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
          {event.description || "Open this event to read full details, timing, and attendance information."}
        </p>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-gray-400" />
            <span>{formatEventDate(event)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-gray-400" />
            <span>{(event.time || "TBA").split(" - ")[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-gray-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            <span>{event.isRegistered ? "You are going" : event.hasSession ? "RSVP open" : "Login needed"}</span>
            <span>{event.club_id ? "Club hosted" : "Campus hosted"}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <EventRsvpAction
            eventId={event.id}
            hasSession={event.hasSession}
            isRegistered={event.isRegistered}
            variant="compact"
            onChange={onRsvpChange}
          />
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line-soft)] bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-[rgba(71,10,104,0.25)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            View details
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function EventsPanel({ initialEvents }: { initialEvents: EventDetail[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState<EventFilter>("All");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const handleRsvpChange = (payload: {
    eventId: string;
    isRegistered: boolean;
    registrationsCount: number;
  }) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === payload.eventId
          ? {
              ...event,
              isRegistered: payload.isRegistered,
              registrationsCount: payload.registrationsCount,
            }
          : event,
      ),
    );
  };

  const now = useMemo(() => new Date(), []);
  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        const aDate = parseEventDate(a)?.getTime() ?? Number.POSITIVE_INFINITY;
        const bDate = parseEventDate(b)?.getTime() ?? Number.POSITIVE_INFINITY;
        return aDate - bDate;
      }),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const matchesFilter = (event: EventDetail) => {
      const date = parseEventDate(event);

      if (filter === "Today") {
        return Boolean(date && isTodayDate(date, now));
      }

      if (filter === "This Week") {
        return Boolean(date && isThisWeek(date, now));
      }

      if (filter === "Free") {
        return Boolean(event.isFree);
      }

      if (filter === "Clubs") {
        return Boolean(event.club_id);
      }

      return true;
    };

    return sortedEvents
      .filter((event) => matchesFilter(event))
      .filter((event) => matchesSearch(event, deferredSearch));
  }, [deferredSearch, filter, now, sortedEvents]);

  const upcomingCount = sortedEvents.filter((event) => {
    const date = parseEventDate(event);
    if (!date) return true;
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay >= now;
  }).length;

  const todayCount = sortedEvents.filter((event) => {
    const date = parseEventDate(event);
    return Boolean(date && isTodayDate(date, now));
  }).length;

  const freeCount = sortedEvents.filter((event) => event.isFree).length;
  const clubHostCount = new Set(sortedEvents.map((event) => event.clubName).filter(Boolean)).size;

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  return (
    <div className="min-h-screen bg-[var(--page-background)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-8">
        <section className="max-w-3xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
              Campus calendar
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Events
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              Browse upcoming campus events, filter quickly, and open the details students need
              most often: date, location, host, and RSVP status.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{filteredEvents.length}</span>
                <span className="text-gray-500">Showing</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{upcomingCount}</span>
                <span className="text-gray-500">Upcoming</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{todayCount}</span>
                <span className="text-gray-500">Today</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{freeCount}</span>
                <span className="text-gray-500">Free</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{clubHostCount}</span>
                <span className="text-gray-500">Club hosts</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 max-w-5xl">
          <label htmlFor="event-search" className="field-shell flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input
              id="event-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Search events, clubs, locations, or keywords"
              className="w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-gray-400 focus-visible:outline-none"
            />
          </label>
        </section>

        <section className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const active = filter === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                  active
                    ? "border border-[var(--line-soft)] bg-white text-gray-950 shadow-sm"
                    : "border border-[var(--line-soft)] bg-transparent text-gray-600 hover:bg-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </section>

        <section className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
              Campus directory
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Event listings
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              Showing {filteredEvents.length} of {sortedEvents.length} event
              {sortedEvents.length === 1 ? "" : "s"}
              {search ? ` matching "${search}"` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
              <span className="font-semibold text-gray-950">{todayCount}</span>
              <span className="ml-2 text-gray-500">Today</span>
            </div>
            <div className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
              <span className="font-semibold text-gray-950">{clubHostCount}</span>
              <span className="ml-2 text-gray-500">Club hosts</span>
            </div>
          </div>
        </section>

        <main className="mt-6">
          {visibleEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} onRsvpChange={handleRsvpChange} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-950">No events match this view</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-600">
                Try another filter or search term.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter("All");
                  setSearch("");
                  setVisibleCount(INITIAL_VISIBLE);
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3C0957] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Reset filters
              </button>
            </div>
          )}

          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + LOAD_MORE_STEP)}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3C0957] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Load more
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
