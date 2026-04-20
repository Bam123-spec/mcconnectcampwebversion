import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Search, Tag, Users } from "lucide-react";
import { getPublicClubs } from "@/lib/clubs";

export const metadata = {
  title: "Clubs & Organizations | Raptor Connect",
  description: "Browse and join student organizations at Montgomery College.",
};

type ClubsSearchParams = {
  q?: string;
  category?: string;
  campus?: string;
  day?: string;
  limit?: string;
};

const DEFAULT_LIMIT = 9;
const LOAD_MORE_STEP = 9;

const normalizeFilter = (value?: string) => {
  const clean = value?.trim();
  return clean && clean !== "All" ? clean : undefined;
};

const buildLoadMoreHref = (params: ClubsSearchParams, nextLimit: number) => {
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (key === "limit" || !value?.trim()) return;
    nextParams.set(key, value);
  });

  nextParams.set("limit", String(nextLimit));
  return `/clubs?${nextParams.toString()}`;
};

export default async function ClubsPage({
  searchParams,
}: {
  searchParams?: Promise<ClubsSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = resolvedSearchParams.q?.trim() || "";
  const limit = Math.max(DEFAULT_LIMIT, Number(resolvedSearchParams.limit) || DEFAULT_LIMIT);
  const clubsResult = await getPublicClubs({
    q: query,
    category: normalizeFilter(resolvedSearchParams.category),
    campus: normalizeFilter(resolvedSearchParams.campus),
    day: normalizeFilter(resolvedSearchParams.day),
    limit,
  });
  const clubs = clubsResult.clubs;

  return (
    <main className="min-h-screen bg-[#f6f6f4]">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#51237f]">
              Student life
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl">
              Clubs and organizations
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              Find student groups by campus, interest, and meeting schedule. Club details
              come from the live campus directory.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form className="mb-7 rounded-xl border border-gray-200 bg-white p-4 shadow-sm" action="/clubs">
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,1.5fr)_1fr_1fr_1fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search clubs</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search by club name or keyword"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
              />
            </label>

            <label className="block">
              <span className="sr-only">Category</span>
              <select
                name="category"
                defaultValue={resolvedSearchParams.category || "All"}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
              >
                <option value="All">All categories</option>
                {clubsResult.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Campus</span>
              <select
                name="campus"
                defaultValue={resolvedSearchParams.campus || "All"}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
              >
                <option value="All">All campuses</option>
                {clubsResult.campuses.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Meeting day</span>
              <select
                name="day"
                defaultValue={resolvedSearchParams.day || "All"}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
              >
                <option value="All">Any day</option>
                {clubsResult.days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="h-11 rounded-lg bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#3f1b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-950">Campus directory</h2>
            <p className="mt-1 text-sm text-gray-500">
              Showing {clubsResult.visibleCount} of {clubsResult.totalCount} organization
              {clubsResult.totalCount === 1 ? "" : "s"}
              {query ? ` matching "${query}"` : ""}
            </p>
          </div>
          <Link href="/clubs" className="rounded-md text-sm font-semibold text-[#51237f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">
            Clear filters
          </Link>
        </div>

        {clubs.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {clubs.map((club) => (
              <article
                key={club.id}
                className="group flex min-h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-32 bg-gray-100">
                  {club.coverImageUrl ? (
                    <Image src={club.coverImageUrl} alt="" fill className="object-cover" sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#e9e4ee] text-3xl font-semibold text-[#51237f]">
                      {club.initials}
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    {club.category}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold leading-snug text-gray-950 group-hover:text-[#51237f]">
                      {club.name}
                    </h3>
                    <span className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
                      {club.initials}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{club.description}</p>

                  <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#51237f]" />
                      <span className="truncate">{club.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#51237f]" />
                      <span>{club.meetingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#51237f]" />
                      <span>{club.memberCount} members</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                      <Tag className="h-3.5 w-3.5" />
                      {club.campus}
                    </div>
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="rounded-lg border border-[#51237f] px-4 py-2 text-sm font-semibold text-[#51237f] transition hover:bg-[#51237f] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                    >
                      View club
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-gray-950">No clubs found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              Try a broader search, remove one filter, or browse the full directory.
            </p>
            <Link
              href="/clubs"
              className="mt-5 inline-flex rounded-lg bg-[#51237f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3f1b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              View all clubs
            </Link>
          </div>
        )}

        {clubsResult.hasMore ? (
          <div className="mt-8 flex justify-center">
            <Link
              href={buildLoadMoreHref(resolvedSearchParams, limit + LOAD_MORE_STEP)}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#51237f] hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              Load more clubs
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
