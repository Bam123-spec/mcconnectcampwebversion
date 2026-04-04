import { type WebEventCardEvent } from "@/components/events/EventCard";
import { EventsPanel } from "@/components/events/events-panel";
import { previewEvents } from "@/lib/preview-data";

export default async function EventsPage() {
  const events: WebEventCardEvent[] = previewEvents;

  return (
    <EventsPanel initialEvents={events} />
  );
}
