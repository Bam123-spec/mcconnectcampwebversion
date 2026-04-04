"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EventCard, type WebEventCardEvent } from "@/components/events/EventCard";
import { supabase } from "@/lib/supabase";
import { AUTH_ENABLED } from "@/lib/features";

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export function EventsPanel({ initialEvents }: { initialEvents: WebEventCardEvent[] }) {
  const router = useRouter();
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [pendingEventIds, setPendingEventIds] = useState<Set<string>>(new Set());
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!AUTH_ENABLED) {
      return;
    }

    let mounted = true;

    const syncRegistrations = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setHasSession(false);
        setRegisteredIds(new Set());
        return;
      }

      setHasSession(true);

      const { data, error: registrationsError } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", user.id);

      if (!mounted) return;

      if (registrationsError) {
        console.error("Error loading web RSVP state:", registrationsError);
        setError("We couldn't load your RSVP status right now.");
        return;
      }

      setRegisteredIds(new Set((data || []).map((registration) => registration.event_id).filter(Boolean)));
    };

    syncRegistrations();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncRegistrations();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleToggleRsvp = async (eventId: string, isRegistered: boolean) => {
    if (!AUTH_ENABLED) return;
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setHasSession(true);
    setPendingEventIds((current) => new Set(current).add(eventId));

    const nextRegisteredIds = new Set(registeredIds);
    if (isRegistered) {
      nextRegisteredIds.delete(eventId);
    } else {
      nextRegisteredIds.add(eventId);
    }
    setRegisteredIds(nextRegisteredIds);

    const request = isRegistered
      ? supabase.from("event_registrations").delete().eq("event_id", eventId).eq("user_id", user.id)
      : supabase.from("event_registrations").insert([{ event_id: eventId, user_id: user.id }]);

    const { error: toggleError } = await request;

    if (toggleError) {
      console.error("Error toggling RSVP:", toggleError);
      setError(isRegistered ? "We couldn't cancel your RSVP." : "We couldn't save your RSVP.");
      setRegisteredIds((current) => {
        const reverted = new Set(current);
        if (isRegistered) {
          reverted.add(eventId);
        } else {
          reverted.delete(eventId);
        }
        return reverted;
      });
    }

    setPendingEventIds((current) => {
      const next = new Set(current);
      next.delete(eventId);
      return next;
    });
  };

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();

    const upcoming = initialEvents.filter((event) => {
      const parsed = parseLocalDate(event.date);
      return parsed ? parsed >= now : false;
    });

    const past = initialEvents
      .filter((event) => {
        const parsed = parseLocalDate(event.date);
        return parsed ? parsed < now : false;
      })
      .reverse();

    return {
      upcomingEvents: upcoming,
      pastEvents: past,
    };
  }, [initialEvents]);

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="text-5xl font-black mb-4 tracking-tight text-gray-900">Campus Events</h1>
        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
          Discover what&apos;s happening. From career fairs to tech showcases, stay connected with the Montgomery College community.
        </p>
      </header>

      {error ? (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

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
                isRegistered={registeredIds.has(event.id)}
                isPending={pendingEventIds.has(event.id)}
                onToggleRsvp={handleToggleRsvp}
                hasSession={hasSession}
                authEnabled={AUTH_ENABLED}
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
              isRegistered={registeredIds.has(event.id)}
              hasSession={hasSession}
              authEnabled={AUTH_ENABLED}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
