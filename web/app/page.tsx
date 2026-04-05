import Link from "next/link";
import Image from "next/image";
import { Users, Search, ExternalLink } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { ForYouSection } from "@/components/home/for-you-section";
import { CampusAccessPanel } from "@/components/home/campus-access-panel";
import { FromYourClubsSection } from "@/components/home/from-your-clubs-section";
import { AUTH_ENABLED } from "@/lib/features";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getClubPath } from "@/lib/club-utils";
import {
  formatEventDateLabel,
  getClubColor,
  getClubInitials,
  inferCampus,
  inferClubCategory,
  normalizeEventForWeb,
} from "@/lib/live-data";

type NewsRow = {
  id: string;
  title?: string | null;
  created_at?: string | null;
  category?: string | null;
  author?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

const QUICK_LINKS = [
  { id: "q1", name: "Events Guide", url: "/docs/events" },
  { id: "q2", name: "Getting Started", url: "/docs" },
  { id: "q3", name: "Interactive Campus Map", url: "/docs/navigating" },
  { id: "q4", name: "Privacy & Access", url: "/docs/privacy" },
];

const fallbackEventCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";

export default async function Home() {
  const supabase = createServerSupabaseClient();

  const [{ data: eventsData }, { data: clubsData }, { data: newsData }] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, description, location, date, day, time, cover_image_url, clubs(name)")
      .order("date", { ascending: true, nullsFirst: false })
      .order("day", { ascending: true, nullsFirst: false })
      .limit(9),
    supabase
      .from("clubs")
      .select("id, name, description, cover_image_url, member_count")
      .order("member_count", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .limit(3),
    supabase
      .from("forum_posts")
      .select("id, title, created_at, category, author:author_id(full_name)")
      .eq("category", "announcements")
      .order("created_at", { ascending: false })
      .limit(2),
  ]);

  const eventIds = (eventsData ?? []).map((event) => event.id);
  const { data: registrations } = eventIds.length
    ? await supabase
        .from("event_registrations")
        .select("event_id")
        .in("event_id", eventIds)
        .limit(1000)
    : { data: [] as Array<{ event_id: string }> };

  const registrationCounts = new Map<string, number>();
  for (const row of registrations ?? []) {
    registrationCounts.set(row.event_id, (registrationCounts.get(row.event_id) ?? 0) + 1);
  }

  const homepageEvents = (eventsData ?? []).map((event) =>
    normalizeEventForWeb({
      ...event,
      rsvp_count: registrationCounts.get(event.id) ?? 0,
    })
  );
  const spotlightEvent = homepageEvents[0] ?? null;
  const featuredEvents = homepageEvents.slice(0, 3);
  const trendingEvents = [...homepageEvents]
    .sort((left, right) => {
      const countDelta = (right.rsvp_count ?? 0) - (left.rsvp_count ?? 0);
      if (countDelta !== 0) {
        return countDelta;
      }

      return new Date(left.date).getTime() - new Date(right.date).getTime();
    })
    .slice(0, Math.min(4, homepageEvents.length));
  const featuredClubs = (clubsData ?? []).map((club) => ({
    id: club.id,
    name: club.name,
    category: inferClubCategory(club),
    members: club.member_count ?? 0,
    campus: inferCampus(),
    initials: getClubInitials(club.name),
    color: getClubColor(club.id),
  }));
  const latestNews = ((newsData ?? []) as NewsRow[]).map((news) => {
    const author = Array.isArray(news.author) ? news.author[0] : news.author;
    const date = news.created_at ? new Date(news.created_at) : null;
    return {
      id: news.id,
      title: news.title || "Campus announcement",
      date: date
        ? date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })
        : "Recently posted",
      author: author?.full_name || "Montgomery College",
      group: news.category ? news.category.charAt(0).toUpperCase() + news.category.slice(1) : "Announcement",
    };
  });

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-6 md:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">
              Montgomery College
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-gray-950 md:text-5xl">
              What&apos;s happening this week at Montgomery College.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              See what students are joining, discover events worth your time, and keep up with the clubs shaping campus this week.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex items-center rounded-md bg-[#51237f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45206b]"
              >
                Explore Events
              </Link>
              <Link
                href="/clubs"
                className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                Browse Clubs
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="font-semibold text-gray-900">{homepageEvents.length}</p>
                <p className="text-gray-500">events on deck</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{featuredClubs.length}</p>
                <p className="text-gray-500">active clubs featured</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {(trendingEvents[0]?.rsvp_count ?? 0).toLocaleString()}
                </p>
                <p className="text-gray-500">students in the top event</p>
              </div>
            </div>
          </div>

          {spotlightEvent ? (
            <Link
              href="/events"
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={spotlightEvent.cover_image_url || fallbackEventCover}
                  alt={spotlightEvent.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#ede7f6] px-3 py-1 text-[11px] font-semibold text-[#51237f]">
                    Happening This Week
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {(spotlightEvent.rsvp_count ?? 0).toLocaleString()} going
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold leading-tight text-gray-950">
                    {spotlightEvent.name}
                  </h2>
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    {formatEventDateLabel(spotlightEvent.date, spotlightEvent.time)}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{spotlightEvent.location}</p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600">
                    {spotlightEvent.organizer_name || "Campus event"}
                  </p>
                  <span className="text-sm font-semibold text-[#51237f]">View details</span>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-14 px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <ForYouSection />

        <section>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">
                Happening This Week
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                Start with the events students are actually showing up for
              </h2>
            </div>

            <form action="/events" className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search events..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#51237f] md:w-64"
                />
              </div>
              <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                Search
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} authEnabled={AUTH_ENABLED} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <FromYourClubsSection />

          {trendingEvents.length ? (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">
                    Trending Now
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                    Popular events moving fastest
                  </h2>
                </div>
                <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
                  All events
                </Link>
              </div>

              <div className="space-y-4">
                {trendingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href="/events"
                    className="flex items-center gap-4 rounded-xl border border-gray-200 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={event.cover_image_url || fallbackEventCover}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-[#fff3e8] px-2 py-0.5 text-[11px] font-semibold text-[#8a3c00]">
                          🔥 Trending
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {event.rsvp_count ?? 0} going
                        </span>
                      </div>
                      <h3 className="mt-2 line-clamp-2 text-base font-bold leading-tight text-gray-900">
                        {event.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {formatEventDateLabel(event.date, event.time)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">
                  Campus Updates
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                  News and announcements worth checking
                </h2>
              </div>
              <Link
                href="/announcements"
                className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                All News
              </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {latestNews.length ? (
                latestNews.map((news, index) => (
                  <div
                    key={news.id}
                    className={`p-5 ${index !== latestNews.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#51237f]">
                      {news.group}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-gray-900">{news.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {news.date} · <span className="font-medium text-gray-700">{news.author}</span>
                    </p>
                    <Link
                      href={`/announcements/${news.id}`}
                      className="mt-4 inline-flex items-center text-sm font-semibold text-[#51237f] hover:underline"
                    >
                      Read update
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">
                  No announcement posts are available yet.
                </div>
              )}
            </div>
          </section>

          <div className="space-y-8">
            <CampusAccessPanel />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">
                    Featured Clubs
                  </p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-gray-950">
                    Communities students are finding first
                  </h3>
                </div>
                <div className="space-y-4">
                  {featuredClubs.map((club) => (
                    <div key={club.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <Link
                        href={getClubPath(club.id)}
                        className="mb-1 flex items-center gap-3 font-bold text-[#51237f] hover:underline"
                      >
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-black text-white ${club.color}`}
                        >
                          {club.initials}
                        </span>
                        <span>{club.name}</span>
                      </Link>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">{club.category}</span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {club.members} members
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/clubs"
                    className="inline-flex items-center text-sm font-semibold text-[#51237f] hover:underline"
                  >
                    View all groups
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">
                    Campus Resources
                  </p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-gray-950">
                    Helpful links when you need them
                  </h3>
                </div>
                <div className="space-y-3">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.id}
                      href={link.url}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#51237f]"
                    >
                      {link.name}
                      <ExternalLink size={16} className="text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
