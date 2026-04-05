import Link from "next/link";
import { Search } from "lucide-react";
import { ClubsDirectory } from "@/components/clubs/clubs-directory";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getClubColor, getClubInitials, inferCampus, inferClubCategory } from "@/lib/live-data";

export const metadata = {
  title: "Clubs & Organizations | Raptor Connect",
  description: "Browse and join student organizations at Montgomery College.",
};

type ClubCardData = {
  id: string;
  name: string;
  description: string;
  members: number;
  campus: string;
  category: string;
  initials: string;
  color: string;
  coverImageUrl: string | null;
};

export default async function ClubsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.q?.trim() || "";
  const supabase = createServerSupabaseClient();

  let request = supabase
    .from("clubs")
    .select("id, name, description, cover_image_url, member_count")
    .order("member_count", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (query.length >= 2) {
    request = request.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data } = await request.limit(60);

  const displayClubs: ClubCardData[] = (data ?? []).map((club) => ({
    id: club.id,
    name: club.name,
    description: club.description ?? "Montgomery College student organization",
    members: club.member_count ?? 0,
    campus: inferCampus(),
    category: inferClubCategory(club),
    initials: getClubInitials(club.name),
    color: getClubColor(club.id),
    coverImageUrl: club.cover_image_url ?? null,
  }));

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
              Student Organizations
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Discover your community. Browse the clubs already active across Montgomery
              College and find the groups where students are leading, creating, and
              connecting.
            </p>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <Link
              href="/docs"
              className="inline-flex w-full md:w-auto items-center justify-center bg-[#51237f] hover:bg-[#51237f]/90 text-white px-8 py-3.5 rounded-full font-bold shadow-lg transition-colors text-lg"
            >
              Start a Club
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-[72px] z-20">
          <form className="w-full md:w-1/3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search organizations by name or keyword..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51237f] focus:border-transparent text-sm"
            />
          </form>

          <p className="w-full md:w-auto text-sm text-gray-500">
            Browse all live organizations currently listed in Raptor Connect.
          </p>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {displayClubs.length} organization{displayClubs.length === 1 ? "" : "s"}
            {query ? ` matching "${query}"` : ""}
          </p>
        </div>

        <ClubsDirectory initialClubs={displayClubs} />

      </div>
    </div>
  );
}
