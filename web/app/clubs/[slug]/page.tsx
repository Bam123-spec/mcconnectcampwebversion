import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { slugifyClubName } from "@/lib/club-utils";
import { ClubProfilePanel } from "@/components/clubs/club-profile-panel";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatOfficerRole, inferClubCategory } from "@/lib/live-data";

type OfficerRow = {
  role?: string | null;
  user_id?: string | null;
  profiles?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

type MemberRow = {
  user_id?: string | null;
  created_at?: string | null;
  profiles?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

type FeedPostRow = {
  id: string;
  content?: string | null;
  created_at?: string | null;
};

const derivePostTitle = (value?: string | null) => {
  const content = (value || "").trim();
  if (!content) return "Club update";

  const firstSentence = content.split(/[.!?]/)[0]?.trim() || content;
  return firstSentence.length > 64 ? `${firstSentence.slice(0, 61).trim()}…` : firstSentence;
};

const getClubBySlug = async (slug: string) => {
  const supabase = createServerSupabaseClient();
  const { data: directClub, error: directClubError } = await supabase
    .from("clubs")
    .select("id, name, description, cover_image_url, member_count")
    .eq("id", slug)
    .maybeSingle();

  let club = directClubError ? null : directClub;

  if (!club) {
    const { data: clubs, error: clubsError } = await supabase
      .from("clubs")
      .select("id, name, description, cover_image_url, member_count")
      .order("name", { ascending: true });

    if (clubsError) {
      return null;
    }

    club = (clubs ?? []).find((entry) => slugifyClubName(entry.name || "") === slug) ?? null;
  }

  if (!club?.id) return null;

  const [{ data: events }, { data: officers }, { data: members }, postsResult] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, date, day, time, location")
      .eq("club_id", club.id)
      .order("date", { ascending: true, nullsFirst: false })
      .order("day", { ascending: true, nullsFirst: false })
      .limit(8),
    supabase
      .from("officers")
      .select("user_id, role, profiles!user_id(full_name)")
      .eq("club_id", club.id)
      .limit(12),
    supabase
      .from("club_members")
      .select("user_id, created_at, profiles:user_id(full_name)")
      .eq("club_id", club.id)
      .eq("status", "approved")
      .limit(24),
    supabase
      .from("posts")
      .select("id, content, created_at")
      .eq("club_id", club.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const officerNames = ((officers ?? []) as OfficerRow[])
    .map((officer) => {
      const profile = Array.isArray(officer.profiles) ? officer.profiles[0] : officer.profiles;
      if (!profile?.full_name) return null;
      return `${profile.full_name} · ${formatOfficerRole(officer.role)}`;
    })
    .filter(Boolean) as string[];

  const officerIds = new Set(
    ((officers ?? []) as OfficerRow[])
      .map((officer) => officer.user_id)
      .filter(Boolean) as string[]
  );

  const memberPreview = ((members ?? []) as MemberRow[])
    .map((member) => {
      const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
      if (!member.user_id || !profile?.full_name) return null;

      return {
        id: member.user_id,
        name: profile.full_name,
        joinedAt: member.created_at ?? null,
        roleLabel: officerIds.has(member.user_id) ? "Leadership" : "Member",
      };
    })
    .filter(Boolean) as Array<{ id: string; name: string; joinedAt: string | null; roleLabel: string }>;

  const feedPosts = postsResult.error
    ? []
    : ((postsResult.data ?? []) as FeedPostRow[]).map((post) => ({
        id: post.id,
        title: derivePostTitle(post.content),
        content: post.content || "A new club update is available.",
        createdAt: post.created_at ?? null,
        category: "post",
      }));

  return {
    club: {
      id: club.id,
      name: club.name,
      description: club.description ?? "",
      coverImageUrl: club.cover_image_url ?? null,
      memberCount: club.member_count ?? 0,
      slug: slugifyClubName(club.name),
      category: inferClubCategory({
        name: club.name,
        description: club.description,
      }),
    },
    events: (events ?? []).map((event) => ({
      id: event.id,
      name: event.name,
      date: event.date || event.day || "",
      time: event.time || "TBA",
      location: event.location || "Location TBA",
    })),
    officerNames,
    members: memberPreview,
    feedPosts,
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

  return (
    <ClubProfilePanel
      initialClub={data.club}
      initialEvents={data.events}
      officerNames={data.officerNames}
      initialMembers={data.members}
      initialFeedPosts={data.feedPosts}
    />
  );
}
