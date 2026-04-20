import { slugifyClubName } from "@/lib/club-utils";
import { createServerSupabaseClient } from "@/lib/supabase";

export type PublicClub = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  location: string;
  day: string;
  time: string;
  meetingTime: string;
  coverImageUrl: string | null;
  email: string | null;
  slug: string;
  category: string;
  initials: string;
};

export type ClubEvent = {
  id: string;
  name: string;
  date: string;
  day: string | null;
  time: string;
  location: string;
};

type ClubRow = {
  id: string;
  name: string | null;
  description: string | null;
  member_count: number | null;
  location: string | null;
  day: string | null;
  time: string | null;
  cover_image_url: string | null;
  email: string | null;
};

type EventRow = {
  id: string;
  name: string | null;
  date: string | null;
  day: string | null;
  time: string | null;
  location: string | null;
};

const clubSelect = "id,name,description,member_count,location,day,time,cover_image_url,email";

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const inferCategory = (name: string, description: string) => {
  const text = `${name} ${description}`.toLowerCase();
  if (/christian|faith|spiritual|religion/.test(text)) return "Faith";
  if (/african|cultural|culture|caribbean|ethiopian|eritrean/.test(text)) return "Cultural";
  if (/math|science|chemistry|physics|stem|computer|cyber/.test(text)) return "Academic";
  if (/student|senate|leadership|government/.test(text)) return "Leadership";
  if (/service|volunteer|community|advocat/.test(text)) return "Service";
  return "Student organization";
};

const normalizeClub = (row: ClubRow): PublicClub => {
  const name = row.name || "Unnamed club";
  const description = row.description || "This club has not added a public description yet.";

  return {
    id: row.id,
    name,
    description,
    memberCount: row.member_count ?? 0,
    location: row.location || "Location to be announced",
    day: row.day || "",
    time: row.time || "",
    meetingTime: [row.day, row.time].filter(Boolean).join(" at ") || "TBA",
    coverImageUrl: row.cover_image_url,
    email: row.email,
    slug: slugifyClubName(name),
    category: inferCategory(name, description),
    initials: getInitials(name),
  };
};

export async function getPublicClubs(query = "") {
  const client = createServerSupabaseClient();
  const { data, error } = await client
    .from("clubs")
    .select(clubSelect)
    .eq("approved", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching public clubs:", error);
    return [];
  }

  const normalized = ((data || []) as ClubRow[]).map(normalizeClub);
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery || trimmedQuery.length < 2) {
    return normalized;
  }

  return normalized.filter((club) =>
    `${club.name} ${club.description} ${club.category} ${club.location}`.toLowerCase().includes(trimmedQuery),
  );
}

export async function getClubBySlug(slug: string) {
  const clubs = await getPublicClubs();
  const club = clubs.find((entry) => entry.slug === slug);

  if (!club) {
    return null;
  }

  const client = createServerSupabaseClient();
  const { data, error } = await client
    .from("events")
    .select("id,name,date,day,time,location")
    .eq("club_id", club.id)
    .eq("approved", true)
    .order("date", { ascending: true, nullsFirst: false })
    .limit(8);

  if (error) {
    console.error("Error fetching club events:", error);
  }

  const events = ((data || []) as EventRow[]).map((event) => ({
    id: event.id,
    name: event.name || "Untitled event",
    date: event.date || "",
    day: event.day,
    time: event.time || "Time to be announced",
    location: event.location || "Location to be announced",
  }));

  return { club, events };
}
