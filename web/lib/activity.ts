import type { PublicClub } from "@/lib/clubs";
import { slugifyClubName } from "@/lib/club-utils";
import { getAuthenticatedClient } from "@/lib/auth-session";
import { getPublicEvents, type EventDetail } from "@/lib/events";

export type ActivityMembership = {
  id: string;
  name: string;
  role: string;
  joinedLabel: string;
  initials: string;
  badgeTone: "officer" | "member";
  slug: string;
};

type ClubMemberRow = {
  id: string;
  status: string | null;
  created_at: string | null;
  clubs:
    | {
        id: string;
        name: string | null;
      }
    | {
        id: string;
        name: string | null;
      }[]
    | null;
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const formatJoinedLabel = (value: string | null) => {
  if (!value) return "Membership active";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Membership active";

  return `Joined ${parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })}`;
};

export async function getUserActivityData(suggestedClubs: PublicClub[]) {
  const session = await getAuthenticatedClient();

  if (!session) {
    return {
      registeredEvents: [] as EventDetail[],
      memberships: [] as ActivityMembership[],
    };
  }

  const [events, registrationsResult, membershipsResult] = await Promise.all([
    getPublicEvents(),
    session.client
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", session.user.id),
    session.client
      .from("club_members")
      .select("id,status,created_at,clubs(id,name)")
      .eq("user_id", session.user.id),
  ]);

  if (registrationsResult.error) {
    console.error("Error loading user event registrations:", registrationsResult.error);
  }

  if (membershipsResult.error) {
    console.error("Error loading user club memberships:", membershipsResult.error);
  }

  const registeredEventIds = new Set(
    (registrationsResult.data || []).map((registration: { event_id: string }) => registration.event_id),
  );
  const registeredEvents = events.filter((event) => registeredEventIds.has(event.id));

  const fallbackClubById = new Map(suggestedClubs.map((club) => [club.id, club]));
  const memberships = ((membershipsResult.data || []) as ClubMemberRow[]).flatMap((membership) => {
      const joinedClub = Array.isArray(membership.clubs) ? membership.clubs[0] : membership.clubs;
      const fallbackClub = joinedClub?.id ? fallbackClubById.get(joinedClub.id) : null;
      const name = joinedClub?.name || fallbackClub?.name;

      if (!name) return [];

      const role = membership.status === "pending" ? "Request pending" : "Member";

      return [{
        id: membership.id,
        name,
        role,
        joinedLabel: formatJoinedLabel(membership.created_at),
        initials: getInitials(name),
        badgeTone: "member",
        slug: fallbackClub?.slug || slugifyClubName(name),
      } satisfies ActivityMembership];
    });

  return {
    registeredEvents,
    memberships,
  };
}
