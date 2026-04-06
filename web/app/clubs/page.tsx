import Link from "next/link";
import { Search } from "lucide-react";
import { ClubsDirectory } from "@/components/clubs/clubs-directory";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getClubColor, getClubInitials, inferCampus, inferClubCategory } from "@/lib/live-data";

export const revalidate = 300;

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

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Cultural", value: "Cultural" },
  { label: "Academic", value: "Academic" },
  { label: "Sports", value: "Sports" },
  { label: "Tech", value: "Technology" },
] as const;

export default async function ClubsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.q?.trim() || "";
  const selectedCategory = resolvedSearchParams?.category?.trim() || "all";
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

  const filteredClubs =
    selectedCategory === "all"
      ? displayClubs
      : displayClubs.filter((club) => club.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="border-b border-gray-200 pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Communities</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950 md:text-4xl">
                Discover Clubs
              </h1>
              <p className="mt-3 text-sm leading-7 text-gray-600 md:text-base">
                Browse active student communities, find your people, and jump into the groups shaping campus life.
              </p>
            </div>

            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
            >
              Start a Club
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <form role="search" aria-label="Search clubs" className="relative max-w-xl">
            <label htmlFor="clubs-search" className="sr-only">
              Search organizations by name or keyword
            </label>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="clubs-search"
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search clubs, interests, or communities"
              className="h-12 w-full rounded-full border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
            />
            {selectedCategory !== "all" ? <input type="hidden" name="category" value={selectedCategory} /> : null}
          </form>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const params = new URLSearchParams();
                if (query) params.set("q", query);
                if (filter.value !== "all") params.set("category", filter.value);
                const href = params.toString() ? `/clubs?${params.toString()}` : "/clubs";
                const isActive = selectedCategory === filter.value;

                return (
                  <Link
                    key={filter.value}
                    href={href}
                    className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                      isActive
                        ? "border-[#51237f] bg-[#51237f] text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-8 mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredClubs.length} club{filteredClubs.length === 1 ? "" : "s"}
            {query ? ` matching "${query}"` : ""}
          </p>
        </div>

        <ClubsDirectory initialClubs={filteredClubs} />
      </div>
    </div>
  );
}
