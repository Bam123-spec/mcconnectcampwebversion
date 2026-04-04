import { type WebEventCardEvent } from "@/components/events/EventCard";
import { EventsPanel } from "@/components/events/events-panel";
import { createServerSupabaseClient } from "@/lib/supabase";

type EventRow = {
  id: string;
  name: string | null;
  description: string | null;
  location: string | null;
  date: string | null;
  day: string | null;
  time: string | null;
  cover_image_url: string | { url?: string; publicUrl?: string } | null;
};

const normalizeEvent = (event: EventRow): WebEventCardEvent => {
  const normalizedDate = event.date || event.day || new Date().toISOString();
  const cover =
    typeof event.cover_image_url === "string"
      ? event.cover_image_url
      : event.cover_image_url?.url || event.cover_image_url?.publicUrl || null;

  return {
    id: event.id,
    name: event.name || "Untitled event",
    description: event.description || "Event details coming soon.",
    location: event.location || "Campus location",
    date: normalizedDate,
    time: event.time || "TBA",
    cover_image_url: cover,
    audience_count: undefined,
  };
};

async function getEvents(): Promise<WebEventCardEvent[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, name, description, location, date, day, time, cover_image_url")
    .order("date", { ascending: true, nullsFirst: false })
    .order("day", { ascending: true, nullsFirst: false })
    .limit(48);

  if (error) {
    console.error("Error loading web events:", error);
    return [];
  }

  const events = (data || []).map((event) => normalizeEvent(event as EventRow));
  const eventIds = events.map((event) => event.id);

  if (eventIds.length === 0) {
    return events;
  }

  const { data: registrations, error: registrationsError } = await supabase
    .from("event_registrations")
    .select("event_id")
    .in("event_id", eventIds);

  if (registrationsError) {
    console.error("Error loading web event registrations:", registrationsError);
    return events;
  }

  const countMap = new Map<string, number>();
  (registrations || []).forEach((registration) => {
    if (!registration.event_id) return;
    countMap.set(registration.event_id, (countMap.get(registration.event_id) || 0) + 1);
  });

  return events.map((event) => ({
    ...event,
    audience_count: countMap.get(event.id) || 0,
  }));
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <EventsPanel initialEvents={events} />
  );
}
