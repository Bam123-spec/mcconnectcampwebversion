import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailPanel } from "@/components/events/event-detail-panel";
import { getEventById } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: "Event Details | Raptor Connect",
      description: "View campus event details.",
    };
  }

  return {
    title: `${event.name} | Campus Events`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return <EventDetailPanel event={event} />;
}
