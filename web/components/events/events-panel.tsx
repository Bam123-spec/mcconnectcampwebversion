"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Search,
} from "lucide-react";
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
  const haystack = [
    event.name,
    event.description,
    event.location,
    event.clubName,
  ]
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
    <article className="ui-surface ui-surface-hover group flex h-full flex-col overflow-hidden">
      <Link
        href={`/events/${event.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <Image
            src={
              event.cover_image_url ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop"
            }
            alt={event.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <div className="rounded-2xl border border-white/75 bg-white/95 px-3 py-2 text-center text-gray-900 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#51237f]">
                {dateParts.month}
              </div>
              <div className="mt-1 text-2xl font-semibold leading-none">{dateParts.day}</div>
              <div className="mt-1 text-[11px] font-medium text-gray-500">{dateParts.weekday}</div>
            </div>

            <div className="rounded-full border border-white/70 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-700 shadow-sm">
              {timingLabel}
            </div>
          </div>

          {event.isFree ? (
            <div className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
              Free
            </div>
          ) : null}

          {event.isRegistered ? (
            <div className="absolute bottom-4 left-4 rounded-full bg-[#51237f] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
              RSVP confirmed
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#51237f]">
              {event.clubName || "Campus event"}
            </div>
            <h3 className="mt-2 line-clamp-2 text-xl font-semibold tracking-tight text-gray-950">
              {event.name}
            </h3>
          </div>
          <div className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
            {attendeeCount} attending
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-gray-600">
          {event.description || "Open this event to read full details, timing, and attendance information."}
        </p>

        <div className="mt-5 space-y-2.5 text-sm text-gray-600">
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

        <div className="mt-5 border-t border-gray-100 pt-4">
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
            className="btn-secondary inline-flex items-center gap-2 text-sm"
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
  const nextEvent = filteredEvents[0] ?? sortedEvents[0] ?? null;

  return (
    <div className="min-h-screen bg-[var(--page-background)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <section className="pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">
              Campus calendar
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              Events
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-gray-600">
              Browse upcoming campus events, filter quickly, and open the details students need
              most often: date, location, host, and RSVP status.
            </p>

            <div className="mt-8 max-w-3xl">
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
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {FILTERS.map((item) => {
                const active = filter === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={active}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2 ${
                      active
                        ? "border border-[var(--line-soft)] bg-white text-gray-950 shadow-sm"
                        : "border border-[var(--line-soft)] bg-transparent text-gray-600 hover:bg-white"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{filteredEvents.length}</span>
                <span className="ml-2 text-gray-500">Showing</span>
              </div>
              <div className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{upcomingCount}</span>
                <span className="ml-2 text-gray-500">Upcoming</span>
              </div>
              <div className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{todayCount}</span>
                <span className="ml-2 text-gray-500">Today</span>
              </div>
              <div className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                <span className="font-semibold text-gray-950">{freeCount}</span>
                <span className="ml-2 text-gray-500">Free</span>
              </div>
            </div>
          </section>

          <aside className="self-start rounded-[24px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">Up next</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              {nextEvent?.name || "No event selected"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              {nextEvent?.description
                ? nextEvent.description
                : "Use the calendar and filters to find the next event that fits your week."}
            </p>

            <div className="mt-5 space-y-3 border-t border-[var(--line-soft)] pt-5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span>{nextEvent ? formatEventDate(nextEvent) : "Date to be announced"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{nextEvent ? (nextEvent.time || "TBA").split(" - ")[0] : "Time to be announced"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{nextEvent?.location || "Location to be announced"}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-muted)] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Free events</div>
                <div className="mt-2 text-2xl font-semibold text-gray-950">{freeCount}</div>
              </div>
              <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-muted)] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Club hosts</div>
                <div className="mt-2 text-2xl font-semibold text-gray-950">{clubHostCount}</div>
              </div>
            </div>

            <Link
              href={nextEvent ? `/events/${nextEvent.id}` : "/events"}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#51237f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#421d68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              Open highlighted event
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </header>

        <main className="mt-10">
          {visibleEvents.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} onRsvpChange={handleRsvpChange} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <h2 className="text-xl font-semibold text-gray-950">No events match this view</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Try another filter or search term.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter("All");
                  setSearch("");
                  setVisibleCount(INITIAL_VISIBLE);
                }}
                className="btn-secondary mt-5 text-sm"
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
                className="btn-secondary text-sm text-gray-700"
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
