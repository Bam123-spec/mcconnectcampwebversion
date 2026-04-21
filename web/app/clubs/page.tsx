import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Search, Sparkles, Tag, Users } from "lucide-react";
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

const buildFilterHref = (
  params: ClubsSearchParams,
  key: "category" | "campus" | "day",
  value?: string,
) => {
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([entryKey, entryValue]) => {
    if (entryKey === "limit" || !entryValue?.trim()) return;
    if (entryKey === key) return;
    nextParams.set(entryKey, entryValue);
  });

  if (value && value !== "All") {
    nextParams.set(key, value);
  }

  return `/clubs${nextParams.toString() ? `?${nextParams.toString()}` : ""}`;
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
  const featuredClubs = clubs.slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--page-background)]">
      <section className="border-b border-[var(--line-soft)] bg-[var(--page-background)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_380px] lg:px-8 lg:py-10">
          <div className="ui-surface overflow-hidden bg-[#1f1830] text-white">
            <div className="relative">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(81,35,127,0.94),rgba(22,32,58,0.92))]" />
              <div className="relative px-7 py-8 sm:px-9 sm:py-10">
                <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88">
                  Student communities
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Find the communities that make campus feel active.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/85">
                  Browse student organizations by category, campus, and meeting schedule.
                  The goal is simple: help students quickly spot groups that feel relevant,
                  welcoming, and worth joining.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4">
                    <div className="text-2xl font-semibold text-white">{clubsResult.totalCount}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/68">
                      Organizations
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4">
                    <div className="text-2xl font-semibold text-white">{clubsResult.categories.length}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/68">
                      Categories
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4">
                    <div className="text-2xl font-semibold text-white">{clubsResult.campuses.length}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/68">
                      Campuses
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {clubsResult.categories.slice(0, 6).map((category) => (
                    <Link
                      key={category}
                      href={buildFilterHref(resolvedSearchParams, "category", category)}
                      className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1830]"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="ui-muted-panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">Discovery snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                  Active clubs now
                </h2>
              </div>
              <Sparkles className="h-5 w-5 text-[#51237f]" />
            </div>

            <div className="mt-5 space-y-3">
              {featuredClubs.length > 0 ? (
                featuredClubs.map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubs/${club.slug}`}
                    className="block rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-4 transition hover:border-[#51237f]/25 hover:bg-[#fbf9fe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#51237f]">
                          {club.category}
                        </div>
                        <h3 className="mt-2 text-base font-semibold leading-snug text-gray-950">{club.name}</h3>
                      </div>
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {club.initials}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-medium text-gray-500">
                      <span>{club.campus}</span>
                      <span>{club.memberCount} members</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-sm leading-6 text-gray-600">
                  Club highlights will appear here when organizations are available.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--line-soft)] bg-white p-4">
              <div className="text-sm font-semibold text-gray-950">Best way to explore</div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Start with a category, then narrow by campus or meeting day if you want a club
                that fits your actual weekly schedule.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <form className="ui-surface p-5" action="/clubs">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#51237f]">
                  Search and filters
                </div>
                <h2 className="mt-2 text-xl font-semibold text-gray-950">Explore clubs</h2>
              </div>

              <div className="mt-5 space-y-4">
                <label className="relative block">
                  <span className="sr-only">Search clubs</span>
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Search by club name or keyword"
                    className="field-shell h-12 w-full pl-11 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Category
                  </span>
                  <select
                    name="category"
                    defaultValue={resolvedSearchParams.category || "All"}
                    className="h-12 w-full rounded-xl border border-[var(--line-soft)] bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
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
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Campus
                  </span>
                  <select
                    name="campus"
                    defaultValue={resolvedSearchParams.campus || "All"}
                    className="h-12 w-full rounded-xl border border-[var(--line-soft)] bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
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
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Meeting day
                  </span>
                  <select
                    name="day"
                    defaultValue={resolvedSearchParams.day || "All"}
                    className="h-12 w-full rounded-xl border border-[var(--line-soft)] bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
                  >
                    <option value="All">Any day</option>
                    {clubsResult.days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="btn-primary flex-1 text-sm"
                  >
                    Search
                  </button>
                  <Link
                    href="/clubs"
                    className="btn-secondary inline-flex items-center justify-center text-sm"
                  >
                    Reset
                  </Link>
                </div>
              </div>
            </form>

            <div className="ui-muted-panel p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#51237f]">
                Browse by category
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {clubsResult.categories.slice(0, 8).map((category) => (
                  <Link
                    key={category}
                    href={buildFilterHref(resolvedSearchParams, "category", category)}
                    className="rounded-full border border-[var(--line-soft)] bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#51237f]/30 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#51237f]">
                  Campus directory
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                  Student organizations
                </h2>
                <p className="mt-2 text-sm leading-7 text-gray-600">
                  Showing {clubsResult.visibleCount} of {clubsResult.totalCount} organization
                  {clubsResult.totalCount === 1 ? "" : "s"}
                  {query ? ` matching "${query}"` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Categories</div>
                  <div className="mt-1 text-lg font-semibold text-gray-950">{clubsResult.categories.length}</div>
                </div>
                <div className="rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Campuses</div>
                  <div className="mt-1 text-lg font-semibold text-gray-950">{clubsResult.campuses.length}</div>
                </div>
              </div>
            </div>

            {clubs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {clubs.map((club) => (
                  <article
                    key={club.id}
                    className="ui-surface ui-surface-hover group flex min-h-full flex-col overflow-hidden"
                  >
                    <div className="relative h-40 bg-gray-100">
                      {club.coverImageUrl ? (
                        <Image
                          src={club.coverImageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(min-width: 1536px) 30vw, (min-width: 768px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#eee7f5_0%,#f7f4fb_100%)] text-3xl font-semibold text-[#51237f]">
                          {club.initials}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/75 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-700 shadow-sm">
                        {club.category}
                      </div>
                      <div className="absolute right-4 top-4 rounded-full border border-white/75 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#51237f] shadow-sm">
                        {club.campus}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold leading-snug text-gray-950 group-hover:text-[#51237f]">
                            {club.name}
                          </h3>
                          <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                            <Tag className="h-3.5 w-3.5" />
                            {club.initials}
                          </div>
                        </div>
                        <div className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                          {club.memberCount} members
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-gray-600">
                        {club.description}
                      </p>

                      <div className="mt-5 space-y-2.5 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#51237f]" />
                          <span className="line-clamp-1">{club.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#51237f]" />
                          <span>{club.meetingTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#51237f]" />
                          <span>{club.memberCount} students connected</span>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                            Explore organization
                          </div>
                          <Link
                            href={`/clubs/${club.slug}`}
                            className="btn-secondary text-sm"
                          >
                            View club
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ui-surface border-dashed px-6 py-14 text-center">
                <h2 className="text-xl font-semibold text-gray-950">No clubs found</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-600">
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
                  className="btn-secondary text-sm"
                >
                  Load more clubs
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
