import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { slugifyClubName } from "@/lib/club-utils";
import { ClubProfilePanel } from "@/components/clubs/club-profile-panel";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatOfficerRole } from "@/lib/live-data";

type OfficerRow = {
  role?: string | null;
  profiles?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

const getClubBySlug = async (slug: string) => {
  const supabase = createServerSupabaseClient();
  const { data: clubs, error: clubsError } = await supabase
    .from("clubs")
    .select("id, name, description, cover_image_url, member_count")
    .order("name", { ascending: true });

  if (clubsError) {
    return null;
  }

  const club = (clubs ?? []).find((entry) => slugifyClubName(entry.name || "") === slug);
  if (!club?.id) return null;

  const [{ data: events }, { data: officers }] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, date, day, time, location")
      .eq("club_id", club.id)
      .order("date", { ascending: true, nullsFirst: false })
      .order("day", { ascending: true, nullsFirst: false })
      .limit(8),
    supabase
      .from("officers")
      .select("role, profiles!user_id(full_name)")
      .eq("club_id", club.id)
      .limit(6),
  ]);

  const officerNames = ((officers ?? []) as OfficerRow[])
    .map((officer) => {
      const profile = Array.isArray(officer.profiles) ? officer.profiles[0] : officer.profiles;
      if (!profile?.full_name) return null;
      return `${profile.full_name} · ${formatOfficerRole(officer.role)}`;
    })
    .filter(Boolean) as string[];

  return {
    club: {
      id: club.id,
      name: club.name,
      description: club.description ?? "",
      coverImageUrl: club.cover_image_url ?? null,
      memberCount: club.member_count ?? 0,
      meetingTime: "TBA",
      slug: slugifyClubName(club.name),
    },
    events: (events ?? []).map((event) => ({
      id: event.id,
      name: event.name,
      date: event.date || event.day || "",
      time: event.time || "TBA",
      location: event.location || "Location TBA",
    })),
    officerNames,
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

  return <ClubProfilePanel initialClub={data.club} initialEvents={data.events} officerNames={data.officerNames} />;
}
