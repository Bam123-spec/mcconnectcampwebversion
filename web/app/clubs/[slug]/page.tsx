import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { slugifyClubName } from "@/lib/club-utils";
import { ClubProfilePanel } from "@/components/clubs/club-profile-panel";
import { previewClubs, previewClubEvents } from "@/lib/preview-data";

const getClubBySlug = async (slug: string) => {
  const club = previewClubs.find((entry) => slugifyClubName(entry.name || "") === slug);
  if (!club?.id) return null;

  return {
    club: {
      id: club.id,
      name: club.name,
      description: club.description,
      coverImageUrl: club.coverImageUrl,
      memberCount: club.members,
      meetingTime: club.meetingTime,
      slug: slugifyClubName(club.name),
    },
    events: previewClubEvents[slug] || [],
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
