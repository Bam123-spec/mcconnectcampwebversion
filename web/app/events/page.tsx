import type { Metadata } from "next";
import { EventsPanel } from "@/components/events/events-panel";
import { getPublicEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Campus Events | Raptor Connect",
  description: "Browse upcoming and past campus events in one clear, easy-to-scan view.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <EventsPanel initialEvents={events} />
  );
}
