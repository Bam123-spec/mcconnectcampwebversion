import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock3 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getClubPath } from "@/lib/club-utils";

type EventRow = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  date?: string | null;
  day?: string | null;
  time?: string | null;
  cover_image_url?: string | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

type AnnouncementRow = {
  id: string;
  title?: string | null;
  content?: string | null;
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

type ClubRow = {
  id: string;
  name?: string | null;
  description?: string | null;
  member_count?: number | null;
  cover_image_url?: string | null;
};

type FeedItem =
  | {
      type: "event";
      id: string;
      title: string;
      clubName: string;
      when: string;
      description: string;
      href: string;
      cta: string;
    }
  | {
      type: "announcement";
      id: string;
      title: string;
      clubName: string;
      when: string;
      description: string;
      href: string;
      cta: string;
    };

type TrendingItem = {
  id: string;
  type: "club" | "event";
  title: string;
  subtitle: string;
  summary: string;
  metric: string;
  href: string;
  imageUrl: string | null;
};

const fallbackEventCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const formatEventDate = (dateValue?: string | null, time?: string | null) => {
  const source = dateValue ?? null;
  if (!source) return time || "Date TBA";

  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return time ? `${source} • ${time}` : source;

  const label = parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return time ? `${label} • ${time}` : label;
};

const formatAnnouncementDate = (value?: string | null) => {
  if (!value) return "Recently posted";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently posted";

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const trimText = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength).trim()}…` : value;

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [{ data: eventsData }, { data: announcementsData }, { data: clubsData }] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, description, location, date, day, time, cover_image_url, clubs(name)")
      .order("date", { ascending: true, nullsFirst: false })
      .order("day", { ascending: true, nullsFirst: false })
      .limit(10),
    supabase
      .from("forum_posts")
      .select("id, title, content, created_at, category, author:author_id(full_name)")
      .eq("category", "announcements")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("clubs")
      .select("id, name, description, member_count, cover_image_url")
      .order("member_count", { ascending: false, nullsFirst: false })
      .limit(6),
  ]);

  const eventIds = (eventsData ?? []).map((event) => event.id);
  const { data: eventRegistrations } = eventIds.length
    ? await supabase
        .from("event_registrations")
        .select("event_id")
        .in("event_id", eventIds)
        .limit(5000)
    : { data: [] as Array<{ event_id: string }> };

  const registrationCounts = new Map<string, number>();
  for (const row of eventRegistrations ?? []) {
    registrationCounts.set(row.event_id, (registrationCounts.get(row.event_id) ?? 0) + 1);
  }

  const upcomingEvents = (eventsData ?? []).slice(0, 8).map((event: EventRow) => {
    const club = firstItem(event.clubs);

    return {
      id: event.id,
      title: event.name,
      clubName: club?.name || "Campus Event",
      when: formatEventDate(event.date || event.day, event.time),
      cover: event.cover_image_url || fallbackEventCover,
      href: "/events",
    };
  });

  const eventFeed: FeedItem[] = (eventsData ?? []).slice(0, 4).map((event: EventRow) => {
    const club = firstItem(event.clubs);

    return {
      type: "event",
      id: `event-${event.id}`,
      title: event.name,
      clubName: club?.name || "Campus Event",
      when: formatEventDate(event.date || event.day, event.time),
      description: trimText(event.description || event.location || "Campus event update", 140),
      href: "/events",
      cta: "View Event",
    };
  });

  const announcementFeed: FeedItem[] = (announcementsData ?? []).slice(0, 4).map((announcement: AnnouncementRow) => {
    const author = firstItem(announcement.author);

    return {
      type: "announcement",
      id: `announcement-${announcement.id}`,
      title: announcement.title || "Campus announcement",
      clubName: author?.full_name || "Montgomery College",
      when: formatAnnouncementDate(announcement.created_at),
      description: trimText(announcement.content || "New update posted for the campus community.", 160),
      href: `/announcements/${announcement.id}`,
      cta: "Read Update",
    };
  });

  const feedItems: FeedItem[] = [];
  const maxLength = Math.max(eventFeed.length, announcementFeed.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (eventFeed[index]) feedItems.push(eventFeed[index]);
    if (announcementFeed[index]) feedItems.push(announcementFeed[index]);
  }

  const trendingEvents: TrendingItem[] = [...(eventsData ?? [])]
    .sort((left, right) => (registrationCounts.get(right.id) ?? 0) - (registrationCounts.get(left.id) ?? 0))
    .slice(0, 2)
    .map((event: EventRow) => {
      const club = firstItem(event.clubs);
      const rsvpCount = registrationCounts.get(event.id) ?? 0;

      return {
        id: `trend-event-${event.id}`,
        type: "event",
        title: event.name,
        subtitle: club?.name || "Campus Event",
        summary: trimText(event.description || event.location || "Campus event update", 120),
        metric: `${rsvpCount} going`,
        href: "/events",
        imageUrl: event.cover_image_url || fallbackEventCover,
      };
    });

  const trendingClubs: TrendingItem[] = (clubsData ?? []).slice(0, 4).map((club: ClubRow) => ({
    id: `trend-club-${club.id}`,
    type: "club",
    title: club.name || "Student Club",
    subtitle: "Trending club",
    summary: trimText(club.description || "Connect with students around shared interests and upcoming campus activity.", 120),
    metric: `${club.member_count ?? 0} members`,
    href: getClubPath(club.id),
    imageUrl: club.cover_image_url || null,
  }));

  const trendingItems: TrendingItem[] = [];
  const trendingLength = Math.max(trendingEvents.length, Math.min(trendingClubs.length, 4));

  for (let index = 0; index < trendingLength; index += 1) {
    if (trendingClubs[index]) trendingItems.push(trendingClubs[index]);
    if (trendingEvents[index]) trendingItems.push(trendingEvents[index]);
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
        <section>
          <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">For You</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950 md:text-4xl">
                What matters on campus today.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
                A personalized mix of upcoming events and campus announcements, organized in one clean feed.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
            >
              Browse Events
            </Link>
          </div>

          <div className="space-y-5">
            {feedItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(17,24,39,0.24)]"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                          item.type === "event"
                            ? "bg-[#f4ecfb] text-[#51237f]"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.type === "event" ? "Event" : "Announcement"}
                      </span>
                      <span className="text-sm font-medium text-[#51237f]">{item.clubName}</span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold leading-tight tracking-[-0.02em] text-gray-950">
                      {item.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-gray-400" />
                        <span>{item.when}</span>
                      </div>
                      <div className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />
                      <div className="flex items-center gap-2">
                        <Clock3 size={15} className="text-gray-400" />
                        <span>{item.type === "event" ? "Campus activity" : "Posted recently"}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-gray-600">{item.description}</p>
                  </div>

                  <div className="sm:pl-4">
                    <Link
                      href={item.href}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
                    >
                      {item.cta}
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            {feedItems.length === 0 ? (
              <article className="rounded-[22px] border border-dashed border-gray-300 bg-white p-8 text-center shadow-[0_12px_28px_-24px_rgba(17,24,39,0.18)]">
                <h2 className="text-xl font-bold text-gray-900">Nothing new just yet</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  New events and announcements will show up here as campus activity picks up.
                </p>
                <Link
                  href="/events"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  Explore campus events
                </Link>
              </article>
            ) : null}
          </div>
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Upcoming Events</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
                Browse what&apos;s coming up next
              </h2>
            </div>
            <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
              See all
            </Link>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex min-w-max gap-4">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={event.href}
                  className="w-[286px] shrink-0 rounded-[22px] border border-gray-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(17,24,39,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-24px_rgba(17,24,39,0.28)]"
                >
                  <div className="relative h-40 overflow-hidden rounded-[18px] bg-gray-100">
                    <Image src={event.cover} alt={event.title} fill className="object-cover" />
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex rounded-full bg-[#f4ecfb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f]">
                      {event.clubName}
                    </span>
                    <h3 className="mt-3 text-lg font-bold leading-tight text-gray-950">{event.title}</h3>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays size={15} className="text-gray-400" />
                      <span>{event.when}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Trending Clubs &amp; Events</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
                Popular across campus right now
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {trendingItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_12px_28px_-24px_rgba(17,24,39,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-24px_rgba(17,24,39,0.28)]"
              >
                {item.imageUrl ? (
                  <div className="relative h-36 bg-gray-100">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-20 items-center border-b border-gray-100 bg-gray-50 px-5">
                    <span className="inline-flex rounded-full bg-[#f4ecfb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f]">
                      {item.type}
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-[#f4ecfb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f]">
                      {item.type}
                    </span>
                    <span className="text-sm font-medium text-gray-500">{item.subtitle}</span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold leading-tight text-gray-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.summary}</p>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-[#51237f]">{item.metric}</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {item.type === "club" ? "View Club" : "View Event"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
