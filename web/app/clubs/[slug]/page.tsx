import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ClubProfilePanel } from "@/components/clubs/club-profile-panel";
import { getClubBySlug } from "@/lib/clubs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClubBySlug(slug);

  if (!data) {
    return {
      title: "Club Not Found | Campus Cord",
    };
  }

  return {
    title: `${data.club.name} | Campus Cord`,
    description: data.club.description || `Explore ${data.club.name} on Campus Cord.`,
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
      initialOfficers={data.officers}
      viewerState={data.viewerState}
    />
  );
}
