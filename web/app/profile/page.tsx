import type { Metadata } from "next";
import { ProfilePanel } from "@/components/profile/profile-panel";
import { getCurrentProfile } from "@/lib/auth-session";
import { getUserActivityData } from "@/lib/activity";
import { getPublicClubs } from "@/lib/clubs";
import { getPublicEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Profile | Campus Cord",
  description: "View your Campus Cord profile, club memberships, and upcoming events.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [profile, events, clubsResult] = await Promise.all([
    getCurrentProfile(),
    getPublicEvents(),
    getPublicClubs({ limit: 12 }),
  ]);
  const clubs = clubsResult.clubs;
  const userActivity = await getUserActivityData(clubs);
  const now = new Date();
  const publicUpcomingEvents = events
    .filter((event) => {
      if (!event.date) return true;
      const parsed = new Date(event.date);
      return Number.isNaN(parsed.getTime()) || parsed >= now;
    })
    .slice(0, 4);
  const registeredUpcomingEvents = userActivity.registeredEvents
    .filter((event) => {
      if (!event.date) return true;
      const parsed = new Date(event.date);
      return Number.isNaN(parsed.getTime()) || parsed >= now;
    })
    .slice(0, 6);

  return (
    <ProfilePanel
      profile={profile}
      upcomingEvents={profile ? registeredUpcomingEvents : publicUpcomingEvents}
      memberships={profile ? userActivity.memberships : []}
      suggestedClubs={clubs.slice(0, 6)}
    />
  );
}
