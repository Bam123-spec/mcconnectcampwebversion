import type { Metadata } from "next";
import { ActivityPanel } from "@/components/activity/activity-panel";
import { getPublicClubs } from "@/lib/clubs";
import { getPublicEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Activity | Raptor Connect",
  description: "Manage your club memberships, RSVPs, and campus involvement.",
};

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const [events, clubs] = await Promise.all([getPublicEvents(), getPublicClubs()]);
  const now = new Date();
  const upcomingEvents = events
    .filter((event) => {
      if (!event.date) return true;
      const parsed = new Date(event.date);
      return Number.isNaN(parsed.getTime()) || parsed >= now;
    })
    .slice(0, 4);

  return <ActivityPanel upcomingEvents={upcomingEvents} memberships={[]} suggestedClubs={clubs.slice(0, 6)} />;
}
