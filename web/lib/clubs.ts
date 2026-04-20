import { slugifyClubName } from "@/lib/club-utils";
import { getAuthenticatedClient } from "@/lib/auth-session";
import { createServerSupabaseClient } from "@/lib/supabase";

export type PublicClub = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  location: string;
  campus: string;
  day: string;
  meetingDay: string;
  time: string;
  meetingTime: string;
  coverImageUrl: string | null;
  email: string | null;
  slug: string;
  category: string;
  initials: string;
};

export type ClubFilters = {
  q?: string;
  category?: string;
  campus?: string;
  day?: string;
  limit?: number;
};

export type ClubListResult = {
  clubs: PublicClub[];
  totalCount: number;
  visibleCount: number;
  hasMore: boolean;
  categories: string[];
  campuses: string[];
  days: string[];
};

export type ClubEvent = {
  id: string;
  name: string;
  date: string;
  day: string | null;
  time: string;
  location: string;
};

export type ClubOfficer = {
  id: string;
  name: string;
  email: string | null;
  role: string;
};

export type ClubViewerState = {
  isAuthenticated: boolean;
  isMember: boolean;
  membershipStatus: "pending" | "approved" | "rejected" | null;
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

type OfficerRow = {
  id: string;
  role: string | null;
  email: string | null;
  profiles:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
};

type MembershipRow = {
  status: "pending" | "approved" | "rejected" | null;
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

const inferCampus = (location: string, name: string) => {
  const text = `${location} ${name}`.toLowerCase();
  if (/germantown|\bgt\b/.test(text)) return "Germantown";
  if (/takoma|tpss|tp\/ss|silver spring|cm |hc |st /.test(text)) return "Takoma Park/Silver Spring";
  if (/rockville|rv|pavilion|leggett/.test(text)) return "Rockville";
  if (/virtual|online|zoom/.test(text)) return "Online";
  return "Montgomery College";
};

const normalizeMeetingDay = (value: string | null | undefined) => {
  if (!value) return "To be announced";
  const day = value.trim();
  const weekday = day.match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i)?.[0];
  if (weekday) return weekday[0].toUpperCase() + weekday.slice(1).toLowerCase();
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const parsed = new Date(`${day}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", { weekday: "long" });
    }
  }
  return "To be announced";
};

const normalizeClub = (row: ClubRow): PublicClub => {
  const name = row.name || "Unnamed club";
  const description = row.description || "This club has not added a public description yet.";
  const location = row.location || "Location to be announced";
  const meetingDay = normalizeMeetingDay(row.day);
  const meetingTime =
    meetingDay !== "To be announced" && row.time
      ? `${meetingDay} at ${row.time}`
      : meetingDay !== "To be announced"
        ? meetingDay
        : row.time || "TBA";

  return {
    id: row.id,
    name,
    description,
    memberCount: row.member_count ?? 0,
    location,
    campus: inferCampus(location, name),
    day: row.day || "",
    meetingDay,
    time: row.time || "",
    meetingTime,
    coverImageUrl: row.cover_image_url,
    email: row.email,
    slug: slugifyClubName(name),
    category: inferCategory(name, description),
    initials: getInitials(name),
  };
};

const matchesFilter = (club: PublicClub, filters: ClubFilters) => {
  const query = filters.q?.trim().toLowerCase() || "";
  if (query.length >= 2) {
    const haystack = `${club.name} ${club.description} ${club.category} ${club.location} ${club.campus}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (filters.category && filters.category !== "All" && club.category !== filters.category) {
    return false;
  }

  if (filters.campus && filters.campus !== "All" && club.campus !== filters.campus) {
    return false;
  }

  if (filters.day && filters.day !== "All" && club.meetingDay !== filters.day) {
    return false;
  }

  return true;
};

const getSortedUnique = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export async function getPublicClubs(filters: ClubFilters | string = {}): Promise<ClubListResult> {
  const client = createServerSupabaseClient();
  const normalizedFilters = typeof filters === "string" ? { q: filters } : filters;
  const limit = Math.max(1, normalizedFilters.limit ?? 12);
  const { data, error } = await client
    .from("clubs")
    .select(clubSelect)
    .eq("approved", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching public clubs:", error);
    return {
      clubs: [],
      totalCount: 0,
      visibleCount: 0,
      hasMore: false,
      categories: [],
      campuses: [],
      days: [],
    };
  }

  const normalized = ((data || []) as ClubRow[]).map(normalizeClub);
  const filtered = normalized.filter((club) => matchesFilter(club, normalizedFilters));
  const visible = filtered.slice(0, limit);

  return {
    clubs: visible,
    totalCount: filtered.length,
    visibleCount: visible.length,
    hasMore: filtered.length > visible.length,
    categories: getSortedUnique(normalized.map((club) => club.category)),
    campuses: getSortedUnique(normalized.map((club) => club.campus)),
    days: getSortedUnique(normalized.map((club) => club.meetingDay)),
  };
}

export async function getClubBySlug(slug: string) {
  const clubsResult = await getPublicClubs({ limit: 500 });
  const clubs = clubsResult.clubs;
  const club = clubs.find((entry) => entry.slug === slug);

  if (!club) {
    return null;
  }

  const client = createServerSupabaseClient();
  const [{ data, error }, officerResult, viewerState] = await Promise.all([
    client
      .from("events")
      .select("id,name,date,day,time,location")
      .eq("club_id", club.id)
      .eq("approved", true)
      .order("date", { ascending: true, nullsFirst: false })
      .limit(8),
    client
      .from("officers")
      .select("id,role,email,profiles:user_id(full_name,email)")
      .eq("club_id", club.id),
    getClubViewerState(club.id),
  ]);

  if (error) {
    console.error("Error fetching club events:", error);
  }

  if (officerResult.error) {
    console.error("Error fetching club officers:", officerResult.error);
  }

  const events = ((data || []) as EventRow[]).map((event) => ({
    id: event.id,
    name: event.name || "Untitled event",
    date: event.date || "",
    day: event.day,
    time: event.time || "Time to be announced",
    location: event.location || "Location to be announced",
  }));

  const officers = ((officerResult.data || []) as OfficerRow[]).map((officer) => {
    const profile = Array.isArray(officer.profiles) ? officer.profiles[0] : officer.profiles;

    return {
      id: officer.id,
      name: profile?.full_name || "Club officer",
      email: officer.email || profile?.email || null,
      role: (officer.role || "officer").replace(/_/g, " "),
    };
  });

  return { club, events, officers, viewerState };
}

export async function getClubViewerState(clubId: string): Promise<ClubViewerState> {
  const session = await getAuthenticatedClient();

  if (!session) {
    return {
      isAuthenticated: false,
      isMember: false,
      membershipStatus: null,
    };
  }

  const { data, error } = await session.client
    .from("club_members")
    .select("status")
    .eq("club_id", clubId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching club viewer state:", error);
  }

  const membership = data as MembershipRow | null;
  const membershipStatus = membership?.status ?? null;

  return {
    isAuthenticated: true,
    isMember: membershipStatus === "approved",
    membershipStatus,
  };
}
