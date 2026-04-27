import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Users } from "lucide-react";
import { ClubsFilterBar } from "@/components/clubs/clubs-filter-bar";
import { getCurrentUserClubMemberships, getPublicClubs } from "@/lib/clubs";

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
  const [clubsResult, viewerMemberships] = await Promise.all([
    getPublicClubs({
      q: query,
      category: normalizeFilter(resolvedSearchParams.category),
      campus: normalizeFilter(resolvedSearchParams.campus),
      day: normalizeFilter(resolvedSearchParams.day),
      limit,
    }),
    getCurrentUserClubMemberships(),
  ]);
  const clubs = clubsResult.clubs;
  const joinedClubIds = viewerMemberships.membershipByClubId;
  const joinedClubs = clubs.filter((club) => joinedClubIds.get(club.id) === "approved");
  const highlightedClubs = [...clubs].sort((left, right) => {
    const leftJoined = joinedClubIds.get(left.id) === "approved" ? 1 : 0;
    const rightJoined = joinedClubIds.get(right.id) === "approved" ? 1 : 0;
    return rightJoined - leftJoined || left.name.localeCompare(right.name);
  });

  return (
    <main className="min-h-screen bg-[var(--page-background)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-8">
        <section className="max-w-3xl">
          <div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Clubs
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              Browse student organizations by category, campus, and meeting day. The page stays
              simple on purpose so students can quickly see which communities feel active and
              relevant.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <StatPill label="Organizations" value={clubsResult.totalCount} />
              <StatPill label="Categories" value={clubsResult.categories.length} />
              <StatPill label="Campuses" value={clubsResult.campuses.length} />
            </div>

            {viewerMemberships.isAuthenticated && joinedClubs.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[rgba(71,10,104,0.14)] bg-[rgba(71,10,104,0.05)] px-4 py-3 text-sm text-gray-700">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--primary)]">
                  <CheckCircle2 className="h-4 w-4" />
                  Your clubs
                </span>
                <span className="text-gray-500">
                  You are already in {joinedClubs.length} club{joinedClubs.length === 1 ? "" : "s"}.
                </span>
                <Link
                  href="/activity"
                  className="ml-auto inline-flex items-center gap-2 font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  Open activity
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {clubsResult.categories.slice(0, 6).map((category) => (
                <Link
                  key={category}
                  href={buildFilterHref(resolvedSearchParams, "category", category)}
                  className="rounded-full border border-[var(--line-soft)] bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-[rgba(71,10,104,0.25)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ClubsFilterBar
          key={`${query}|${resolvedSearchParams.category || ""}|${resolvedSearchParams.campus || ""}|${resolvedSearchParams.day || ""}`}
          initialQuery={query}
          initialCategory={resolvedSearchParams.category}
          initialCampus={resolvedSearchParams.campus}
          initialDay={resolvedSearchParams.day}
          categories={clubsResult.categories}
          campuses={clubsResult.campuses}
          days={clubsResult.days}
        />

        <section className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
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

        <section className="mt-6">
          {clubs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {highlightedClubs.map((club) => {
                const isJoined = joinedClubIds.get(club.id) === "approved";

                return (
                <article
                  key={club.id}
                  className="group flex h-full min-h-full flex-col overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(15,23,42,0.07)]"
                >
                  <div className="relative h-28 bg-gray-100 sm:h-32">
                    {club.coverImageUrl ? (
                      <Image
                        src={club.coverImageUrl}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f8f9fc_0%,#eef1f7_100%)] text-2xl font-semibold text-gray-400 transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                        {club.initials}
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-700 shadow-sm">
                      {club.category}
                    </div>
                    <div className="absolute right-3 top-3 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-700 shadow-sm">
                      {club.campus}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-h-[4.5rem] min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-950 transition-colors group-hover:text-[var(--primary)]">
                          {club.name}
                        </h3>
                        <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                          {club.initials}
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full border border-[var(--line-soft)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {club.memberCount} members
                      </div>
                    </div>

                    {isJoined ? (
                      <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(71,10,104,0.14)] bg-[rgba(71,10,104,0.08)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        In your clubs
                      </div>
                    ) : null}

                    <p className="mt-3 min-h-[4.5rem] line-clamp-2 text-sm leading-6 text-gray-600">
                      {club.description}
                    </p>

                    <div className="mt-4 min-h-[5.5rem] space-y-2 border-t border-[var(--line-soft)] pt-3 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="line-clamp-1">{club.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                        <span className="line-clamp-1">{club.meetingTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span>{club.memberCount} students connected</span>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-[var(--line-soft)] pt-3">
                      <Link
                        href={`/clubs/${club.slug}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                      >
                        {isJoined ? "Open club" : "View club"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-950">No clubs found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-600">
                Try a broader search, remove one filter, or browse the full directory.
              </p>
              <Link
                href="/clubs"
                className="mt-5 inline-flex rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
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
