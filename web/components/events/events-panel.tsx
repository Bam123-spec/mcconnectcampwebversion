"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EventCard, type WebEventCardEvent } from "@/components/events/EventCard";
import { AUTH_ENABLED } from "@/lib/features";
import { supabase } from "@/lib/supabase";

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

export function EventsPanel({ initialEvents }: { initialEvents: WebEventCardEvent[] }) {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

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
        }
        return;
      }

      const eventIds = initialEvents.map((event) => event.id);
      if (eventIds.length === 0) {
        if (!cancelled) {
          setHasSession(true);
          setRegisteredIds(new Set());
        }
        return;
      }

      const { data, error } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", user.id)
        .in("event_id", eventIds);

      if (cancelled) return;

      if (error) {
        console.error("Error loading RSVP state:", error);
        setHasSession(true);
        setRegisteredIds(new Set());
        return;
      }

      setHasSession(true);
      setRegisteredIds(new Set((data ?? []).map((row) => row.event_id)));
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

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();

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

    return {
      upcomingEvents: upcoming,
      pastEvents: past,
    };
  }, [initialEvents]);

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
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="text-5xl font-black mb-4 tracking-tight text-gray-900">Campus Events</h1>
        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
          Discover what&apos;s happening. From career fairs to tech showcases, stay connected with the Montgomery College community.
        </p>
        {actionError ? (
          <div className="mt-6 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </div>
        ) : null}
      </header>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            Upcoming
            <span className="text-sm font-bold bg-purple-50 text-[var(--primary)] px-3 py-1 rounded-full border border-purple-100 shadow-sm">
              {upcomingEvents.length}
            </span>
          </h2>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
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
          <div className="glass-card p-16 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-500">Check back later for newly scheduled activities!</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-400">
            Past Events
            <span className="text-sm font-bold bg-gray-50 text-gray-400 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              {pastEvents.length}
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </section>
    </div>
  );
}
