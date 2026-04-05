import { EventsPanel } from "@/components/events/events-panel";
import { createServerSupabaseClient } from "@/lib/supabase";
import { normalizeEventForWeb } from "@/lib/live-data";

export default async function EventsPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("events")
    .select("id, name, description, location, date, day, time, cover_image_url")
    .order("date", { ascending: true, nullsFirst: false })
    .order("day", { ascending: true, nullsFirst: false })
    .limit(60);

  const events = (data ?? []).map((event) => normalizeEventForWeb(event));

  return (
    <EventsPanel initialEvents={events} />
  );
}
