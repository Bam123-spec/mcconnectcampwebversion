import { EventsPanel } from "@/components/events/events-panel";
import { createServerSupabaseClient } from "@/lib/supabase";
import { normalizeEventForWeb } from "@/lib/live-data";

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.q?.trim() || "";
  const supabase = createServerSupabaseClient();
  let request = supabase
    .from("events")
    .select("id, name, description, location, date, day, time, cover_image_url, club_id, clubs(name)")
    .order("date", { ascending: true, nullsFirst: false })
    .order("day", { ascending: true, nullsFirst: false })
    .limit(60);

  if (query.length >= 2) {
    request = request.or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);
  }

  const { data } = await request;
  const eventIds = (data ?? []).map((event) => event.id);

  const { data: registrations } = eventIds.length
    ? await supabase
        .from("event_registrations")
        .select("event_id")
        .in("event_id", eventIds)
        .limit(5000)
    : { data: [] as Array<{ event_id: string }> };

  const registrationCounts = new Map<string, number>();
  for (const row of registrations ?? []) {
    registrationCounts.set(row.event_id, (registrationCounts.get(row.event_id) ?? 0) + 1);
  }

  const events = (data ?? []).map((event) =>
    normalizeEventForWeb({
      ...event,
      rsvp_count: registrationCounts.get(event.id) ?? 0,
    })
  );

  return (
    <EventsPanel initialEvents={events} initialQuery={query} />
  );
}
