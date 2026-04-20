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
