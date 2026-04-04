import Link from "next/link";
import Image from "next/image";
import { Search, Filter, Users, MapPin, Tag } from "lucide-react";
import { slugifyClubName } from "@/lib/club-utils";
import { previewClubs } from "@/lib/preview-data";

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

const getClubs = (query: string): ClubCardData[] => {
  const trimmedQuery = query.trim().toLowerCase();

  return previewClubs.filter((club) => {
    if (!trimmedQuery || trimmedQuery.length < 2) return true;
    return `${club.name} ${club.description} ${club.category}`.toLowerCase().includes(trimmedQuery);
  });
};

export default async function ClubsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.q?.trim() || "";
  const displayClubs = getClubs(query);

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
            <button className="w-full md:w-auto bg-[#51237f] hover:bg-[#51237f]/90 text-white px-8 py-3.5 rounded-full font-bold shadow-lg transition-colors text-lg">
              Register a New Club
            </button>
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

          <div className="w-full md:w-auto flex flex-wrap gap-2 md:gap-4 items-center">
            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2.5 bg-gray-50 text-sm">
              <Filter size={16} className="text-gray-500" />
              <span className="text-gray-700 font-medium">All Campuses</span>
            </div>

            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2.5 bg-gray-50 text-sm">
              <Tag size={16} className="text-gray-500" />
              <span className="text-gray-700 font-medium">All Categories</span>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {displayClubs.length} organization{displayClubs.length === 1 ? "" : "s"}
            {query ? ` matching "${query}"` : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group"
            >
              <div className="h-24 w-full bg-gray-100 relative overflow-hidden">
                {club.coverImageUrl ? (
                  <Image
                    src={club.coverImageUrl}
                    alt={club.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 2px 2px, gray 1px, transparent 0)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                )}
              </div>

              <div className="px-6 pb-6 pt-0 flex-1 flex flex-col relative">
                <div
                  className={`w-16 h-16 rounded-lg ${club.color} flex items-center justify-center text-white font-black text-2xl shadow-md border-4 border-white absolute -top-8 left-6 group-hover:scale-105 transition-transform`}
                >
                  {club.initials}
                </div>

                <div className="mt-10 mb-4">
                  <div className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full mb-2 tracking-wide uppercase">
                    {club.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-[#51237f] transition-colors line-clamp-2">
                    {club.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {club.description}
                  </p>
                </div>

                <div className="mt-auto pt-5 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#51237f]" />
                      {club.members} Members
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#51237f]" />
                      {club.campus}
                    </div>
                  </div>
                  <Link
                    href={`/clubs/${slugifyClubName(club.name)}`}
                    className="flex justify-center w-full py-2.5 bg-gray-50 hover:bg-[#51237f] hover:text-white text-gray-700 font-semibold rounded-md transition-colors border border-gray-200 hover:border-[#51237f]"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-2 mb-12">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            disabled
          >
            Previous
          </button>
          <button className="w-10 h-10 border border-[#51237f] bg-[#51237f] text-white rounded-md flex justify-center items-center font-bold text-sm">
            1
          </button>
          <button className="w-10 h-10 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md flex justify-center items-center font-bold text-sm">
            2
          </button>
          <button className="w-10 h-10 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md flex justify-center items-center font-bold text-sm hidden sm:flex">
            3
          </button>
          <span className="text-gray-400 mx-1">...</span>
          <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
