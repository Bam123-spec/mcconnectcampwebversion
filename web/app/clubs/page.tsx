import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Search, Tag, Users } from "lucide-react";
import { getPublicClubs } from "@/lib/clubs";

export const metadata: Metadata = {
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

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
      <span className="font-semibold text-gray-950">{value}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">
              Student communities
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              Clubs
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-gray-600">
              Browse student organizations by category, campus, and meeting day. The page stays
              simple on purpose so students can quickly see which communities feel active and
              relevant.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <StatPill label="Organizations" value={clubsResult.totalCount} />
              <StatPill label="Categories" value={clubsResult.categories.length} />
              <StatPill label="Campuses" value={clubsResult.campuses.length} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {clubsResult.categories.slice(0, 6).map((category) => (
                <Link
                  key={category}
                  href={buildFilterHref(resolvedSearchParams, "category", category)}
                  className="rounded-full border border-[var(--line-soft)] bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[#51237f]/25 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-[24px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">
                  Active clubs now
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                  Highlights
                </h2>
              </div>
              <Tag className="h-5 w-5 text-[#51237f]" />
            </div>

            <div className="mt-5 space-y-3">
              {featuredClubs.length > 0 ? (
                featuredClubs.map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubs/${club.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] p-4 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--line-soft)] bg-white text-sm font-semibold text-[#51237f]">
                      {club.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#51237f]">
                            {club.category}
                          </p>
                          <h3 className="mt-2 truncate text-base font-semibold text-gray-950 transition-colors group-hover:text-[#421d68]">
                            {club.name}
                          </h3>
                        </div>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition group-hover:text-[#51237f]" />
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>{club.campus}</span>
                        <span>{club.memberCount} members</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-[var(--surface-muted)] px-4 py-8 text-sm leading-6 text-gray-600">
                  Club highlights will appear here when organizations are available.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] p-4">
              <div className="text-sm font-semibold text-gray-950">How to browse</div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Start with a category, then narrow by campus or meeting day if you want a club that
                fits your schedule.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-10 rounded-[24px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <form className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_auto]" action="/clubs">
            <label className="field-shell flex items-center gap-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search clubs by name or keyword"
                className="w-full bg-transparent text-sm text-gray-950 outline-none placeholder:text-gray-400 focus-visible:outline-none"
              />
            </label>

            <label className="block">
              <span className="sr-only">Category</span>
              <select
                name="category"
                defaultValue={resolvedSearchParams.category || "All"}
                className="field-shell h-12 w-full text-sm font-medium text-gray-700 outline-none"
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
                className="field-shell h-12 w-full text-sm font-medium text-gray-700 outline-none"
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
                className="field-shell h-12 w-full text-sm font-medium text-gray-700 outline-none"
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
              <button type="submit" className="btn-primary h-12 px-5 text-sm">
                Search
              </button>
              <Link href="/clubs" className="btn-secondary inline-flex h-12 items-center justify-center px-5 text-sm">
                Reset
              </Link>
            </div>
          </form>
        </section>

        <section className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">
              Campus directory
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Student organizations
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              Showing {clubsResult.visibleCount} of {clubsResult.totalCount} organization
              {clubsResult.totalCount === 1 ? "" : "s"}
              {query ? ` matching "${query}"` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
              <span className="font-semibold text-gray-950">{clubsResult.categories.length}</span>
              <span className="ml-2 text-gray-500">Categories</span>
            </div>
            <div className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
              <span className="font-semibold text-gray-950">{clubsResult.campuses.length}</span>
              <span className="ml-2 text-gray-500">Campuses</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {clubs.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {clubs.map((club) => (
                <article
                  key={club.id}
                  className="group flex min-h-full flex-col overflow-hidden rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)]"
                >
                  <div className="relative aspect-[16/9] bg-gray-100">
                    {club.coverImageUrl ? (
                      <Image
                        src={club.coverImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(min-width: 1536px) 30vw, (min-width: 768px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f8f9fc_0%,#eef1f7_100%)] text-3xl font-semibold text-gray-400">
                        {club.initials}
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-700 shadow-sm">
                      {club.category}
                    </div>
                    <div className="absolute right-4 top-4 rounded-full border border-white/80 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-700 shadow-sm">
                      {club.campus}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-snug text-gray-950 transition-colors group-hover:text-[#421d68]">
                          {club.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                          <Tag className="h-3.5 w-3.5" />
                          {club.initials}
                        </div>
                      </div>
                      <div className="rounded-full border border-[var(--line-soft)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-gray-700">
                        {club.memberCount} members
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-gray-600">
                      {club.description}
                    </p>

                    <div className="mt-5 space-y-2.5 border-t border-[var(--line-soft)] pt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="line-clamp-1">{club.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        <span>{club.meetingTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{club.memberCount} students connected</span>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                          Open details
                        </div>
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-[var(--line-soft)] bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/25 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                        >
                          View club
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
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
        </section>
      </div>
    </main>
  );
}
