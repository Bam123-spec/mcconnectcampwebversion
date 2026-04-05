import type { WebEventCardEvent } from "@/components/events/EventCard";

type ClubLike = {
  id: string;
  name: string;
  description?: string | null;
  member_count?: number | null;
  cover_image_url?: string | null;
};

type EventLike = {
  id: string;
  name: string;
  description?: string | null;
  location: string;
  date?: string | null;
  day?: string | null;
  time?: string | null;
  cover_image_url?: string | null;
  rsvp_count?: number | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

const CLUB_COLORS = [
  "bg-[#51237f]",
  "bg-blue-600",
  "bg-green-600",
  "bg-cyan-600",
  "bg-rose-600",
  "bg-amber-600",
];

const titleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const getClubInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const getClubColor = (clubId: string) => {
  let total = 0;

  for (const char of clubId) {
    total += char.charCodeAt(0);
  }

  return CLUB_COLORS[total % CLUB_COLORS.length];
};

export const inferClubCategory = (club: Pick<ClubLike, "name" | "description">) => {
  const haystack = `${club.name} ${club.description ?? ""}`.toLowerCase();

  if (haystack.includes("student senate") || haystack.includes("government") || haystack.includes("leadership")) {
    return "Leadership";
  }

  if (haystack.includes("ethiopian") || haystack.includes("eritrean") || haystack.includes("culture")) {
    return "Cultural";
  }

  if (haystack.includes("athletic") || haystack.includes("soccer") || haystack.includes("basketball") || haystack.includes("sports")) {
    return "Sports";
  }

  if (haystack.includes("cyber") || haystack.includes("computer") || haystack.includes("technology") || haystack.includes("tech")) {
    return "Technology";
  }

  return "Academic";
};

export const inferCampus = () => "Montgomery College";

export const normalizeEventForWeb = (event: EventLike): WebEventCardEvent => ({
  id: event.id,
  name: event.name,
  description: event.description ?? "",
  location: event.location,
  date: event.date || event.day || new Date().toISOString(),
  time: event.time || "TBA",
  cover_image_url: event.cover_image_url ?? null,
  rsvp_count: event.rsvp_count ?? undefined,
  organizer_name: Array.isArray(event.clubs) ? event.clubs[0]?.name : event.clubs?.name,
});

export const formatJoinedLabel = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `Joined ${date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })}`;
};

export const formatEventDateLabel = (dateValue?: string | null, time?: string | null) => {
  if (!dateValue) return time ? `Date TBA • ${time}` : "Date TBA";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return time ? `${dateValue} • ${time}` : dateValue;

  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return time ? `${dateLabel} • ${time}` : dateLabel;
};

export const formatOfficerRole = (role?: string | null) => {
  if (!role) return "Officer";
  return titleCase(role);
};
