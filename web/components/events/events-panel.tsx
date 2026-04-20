"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Users,
  ArrowRight,
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

function EventCard({
  event,
  onRsvpChange,
}: {
  event: EventDetail;
  onRsvpChange: (payload: { eventId: string; isRegistered: boolean; registrationsCount: number }) => void;
}) {
  const eventDate = parseEventDate(event);
  const isToday =
    eventDate &&
    eventDate.getFullYear() === new Date().getFullYear() &&
    eventDate.getMonth() === new Date().getMonth() &&
    eventDate.getDate() === new Date().getDate();
  const attendeeCount = event.registrationsCount || event.audience_count || 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/events/${event.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">
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

          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-700 shadow-sm">
            {isToday ? "Today" : eventDate ? "Event" : "Campus"}
          </div>

          {event.isFree ? (
            <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
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

      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
          {event.clubName || "Campus event"}
        </div>

        <h3 className="mt-2 text-lg font-semibold tracking-tight text-gray-950">
          {event.name}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-gray-400" />
            <span>{formatEventDate(event)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            <span>{(event.time || "TBA").split(" - ")[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-gray-400" />
              <span>{attendeeCount} attending</span>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {event.isRegistered ? "You are going" : event.hasSession ? "Open RSVP" : "Login needed"}
            </span>
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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
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

  const filteredEvents = useMemo(() => {
    const now = new Date();

    const matchesFilter = (event: EventDetail) => {
      const date = parseEventDate(event);

      if (filter === "Today") {
        return Boolean(
          date &&
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate(),
        );
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

    return events
      .filter((event) => matchesFilter(event))
      .filter((event) => matchesSearch(event, deferredSearch))
      .sort((a, b) => {
        const aDate = parseEventDate(a)?.getTime() ?? Number.POSITIVE_INFINITY;
        const bDate = parseEventDate(b)?.getTime() ?? Number.POSITIVE_INFINITY;
        return aDate - bDate;
      });
  }, [deferredSearch, events, filter]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  return (
    <div className="min-h-screen bg-[#fbfbf9]">
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
            Events
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
            Browse upcoming campus events, filter quickly, and open any event for the details you need.
          </p>

          <div className="mt-6 max-w-2xl">
            <label htmlFor="event-search" className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm shadow-gray-100">
              <Search size={18} className="text-gray-400" />
              <input
                id="event-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search events, clubs, locations"
                className="w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-gray-400 focus-visible:outline-none"
              />
            </label>
          </div>

          <div className="mt-5 border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto">
              {FILTERS.map((item) => {
                const active = filter === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={active}
                    className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "border-gray-950 text-gray-950"
                        : "border-transparent text-gray-500 hover:text-gray-950"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main>
          {visibleEvents.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} onRsvpChange={handleRsvpChange} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
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
                className="mt-5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
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
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
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
