import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase";
import { slugifyClubName } from "@/lib/club-utils";
import { ClubProfilePanel } from "@/components/clubs/club-profile-panel";

type ClubRow = {
  id: string;
  name: string | null;
  description: string | null;
  cover_image_url: string | { url?: string; publicUrl?: string } | null;
  member_count: number | null;
  meeting_time: string | null;
};

type ClubEventRow = {
  id: string;
  name: string | null;
  date: string | null;
  day: string | null;
  time: string | null;
  location: string | null;
};

const normalizeCover = (value: ClubRow["cover_image_url"]) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.url || value.publicUrl || null;
};

const getClubBySlug = async (slug: string) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, description, cover_image_url, member_count, meeting_time")
    .order("name", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Error loading club detail:", error);
    return null;
  }

  const club = ((data || []) as ClubRow[]).find((entry) => slugifyClubName(entry.name || "") === slug);
  if (!club?.id) return null;

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, name, date, day, time, location")
    .eq("club_id", club.id)
    .order("date", { ascending: true, nullsFirst: false })
    .order("day", { ascending: true, nullsFirst: false })
    .limit(8);

  if (eventsError) {
    console.error("Error loading club events:", eventsError);
  }

  return {
    club: {
      id: club.id,
      name: club.name || "Untitled Club",
      description: club.description || "",
      coverImageUrl: normalizeCover(club.cover_image_url),
      memberCount: club.member_count || 0,
      meetingTime: club.meeting_time || "",
      slug: slugifyClubName(club.name || ""),
    },
    events: ((events || []) as ClubEventRow[]).map((event) => ({
      id: event.id,
      name: event.name || "Untitled Event",
      date: event.date || event.day || "",
      time: event.time || "TBA",
      location: event.location || "Campus location",
    })),
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClubBySlug(slug);

  if (!data) {
    return {
      title: "Club Not Found | Raptor Connect",
    };
  }

  return {
    title: `${data.club.name} | Raptor Connect`,
    description: data.club.description || `Explore ${data.club.name} on Raptor Connect.`,
  };
}

export default async function ClubProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getClubBySlug(slug);

  if (!data) {
    notFound();
  }

  return <ClubProfilePanel initialClub={data.club} initialEvents={data.events} />;
}
