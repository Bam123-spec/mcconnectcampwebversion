import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getClubPath } from "@/lib/club-utils";

export const revalidate = 300;

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
      imageUrl: string;
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
      imageUrl: string;
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
  accent?: string;
};

type HomeEventCard = {
  id: string;
  title: string;
  clubName: string;
  when: string;
  eventDate: Date | null;
  cover: string;
  description: string;
  location: string;
  urgency: string;
  href: string;
};

const fallbackEventCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";
const fallbackAnnouncementCover =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop";

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

const getResolvedEventDate = (dateValue?: string | null, fallbackDay?: string | null, time?: string | null) => {
  const source = dateValue || fallbackDay;
  if (!source) return null;

  const candidate = time ? new Date(`${source} ${time}`) : new Date(source);
  if (!Number.isNaN(candidate.getTime())) return candidate;

  const fallback = new Date(source);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getUrgencyLabel = (eventDate: Date | null) => {
  if (!eventDate) return "Coming up";

  const now = new Date();
  if (!isSameDay(eventDate, now)) return "This week";

  const diffMs = eventDate.getTime() - now.getTime();
  if (diffMs > 0) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours <= 0) return "Starting soon";
    if (diffHours === 1) return "Starts in 1 hour";
    if (diffHours <= 6) return `Starts in ${diffHours} hours`;
  }

  if (eventDate.getHours() >= 17) return "Tonight";
  return "Happening today";
};

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

  const eventCards: HomeEventCard[] = (eventsData ?? []).map((event: EventRow) => {
    const club = firstItem(event.clubs);
    const resolvedDate = getResolvedEventDate(event.date, event.day, event.time);

    return {
      id: event.id,
      title: event.name,
      clubName: club?.name || "Campus Event",
      when: formatEventDate(event.date || event.day, event.time),
      eventDate: resolvedDate,
      cover: event.cover_image_url || fallbackEventCover,
      description: trimText(event.description || event.location || "Campus event update", 150),
      location: event.location || "Location TBA",
      urgency: getUrgencyLabel(resolvedDate),
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
      imageUrl: event.cover_image_url || fallbackEventCover,
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
      imageUrl: fallbackAnnouncementCover,
    };
  });

  const feedItems: FeedItem[] = [];
  const maxLength = Math.max(eventFeed.length, announcementFeed.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (eventFeed[index]) feedItems.push(eventFeed[index]);
    if (announcementFeed[index]) feedItems.push(announcementFeed[index]);
  }

  const now = new Date();
  const urgentToday = eventCards.filter((event) => event.eventDate && isSameDay(event.eventDate, now)).slice(0, 3);
  const urgentFallback = eventCards.filter((event) => event.eventDate && event.eventDate >= now).slice(0, 3);
  const urgentEvents = urgentToday.length ? urgentToday : urgentFallback;
  const upcomingDiscovery = eventCards
    .filter((event) => {
      if (!event.eventDate) return false;
      const diff = event.eventDate.getTime() - now.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    })
    .slice(0, 6);

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
        accent: rsvpCount > 0 ? "Popular now" : "Worth opening",
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
    accent: "Growing community",
  }));

  const exploreItems: TrendingItem[] = [];

  if (trendingEvents[0]) exploreItems.push(trendingEvents[0]);
  if (trendingClubs[0]) exploreItems.push(trendingClubs[0]);
  if (upcomingDiscovery[0]) {
    exploreItems.push({
      id: `explore-soon-${upcomingDiscovery[0].id}`,
      type: "event",
      title: upcomingDiscovery[0].title,
      subtitle: upcomingDiscovery[0].clubName,
      summary: upcomingDiscovery[0].description,
      metric: upcomingDiscovery[0].urgency,
      href: upcomingDiscovery[0].href,
      imageUrl: upcomingDiscovery[0].cover,
      accent: "Coming up",
    });
  }
  if (trendingClubs[1]) exploreItems.push(trendingClubs[1]);
  if (trendingEvents[1]) exploreItems.push(trendingEvents[1]);
  if (upcomingDiscovery[1]) {
    exploreItems.push({
      id: `explore-later-${upcomingDiscovery[1].id}`,
      type: "event",
      title: upcomingDiscovery[1].title,
      subtitle: upcomingDiscovery[1].clubName,
      summary: upcomingDiscovery[1].description,
      metric: upcomingDiscovery[1].when,
      href: upcomingDiscovery[1].href,
      imageUrl: upcomingDiscovery[1].cover,
      accent: "This week",
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
        <section>
          <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Happening Now</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950 md:text-4xl">
                Start with what you could miss.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
                Urgent events come first, then the updates and communities most relevant to you.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
            >
              Browse Events
            </Link>
          </div>

          <section>
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Happening Today</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
                Things you can still make it to
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {urgentEvents.map((event, index) => (
                <Link
                  key={event.id}
                  href={event.href}
                  className={`group overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_14px_34px_-26px_rgba(17,24,39,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(17,24,39,0.28)] ${
                    index === 0 ? "md:col-span-2 xl:col-span-2" : ""
                  }`}
                >
                  <div className={`relative overflow-hidden bg-gray-100 ${index === 0 ? "h-72" : "h-56"}`}>
                    <Image
                      src={event.cover}
                      alt={event.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-[#ede7f6]/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#51237f]">
                          {event.urgency}
                        </span>
                        <span className="inline-flex rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                          {event.clubName}
                        </span>
                      </div>
                      <h3 className="mt-4 text-2xl font-black leading-tight tracking-[-0.03em] text-white md:text-3xl">
                        {event.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/86">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} className="text-white/80" />
                          <span>{event.when}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-white/80" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/82">{event.description}</p>
                      <span className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#51237f] transition group-hover:bg-[#f4ecfb]">
                        RSVP or View Event
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {urgentEvents.length === 0 ? (
              <article className="mt-5 rounded-[22px] border border-dashed border-gray-300 bg-white p-8 text-center shadow-[0_12px_28px_-24px_rgba(17,24,39,0.18)]">
                <h2 className="text-xl font-bold text-gray-900">Nothing urgent right now</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Campus activity will show up here as soon as events start clustering around today.
                </p>
              </article>
            ) : null}
          </section>
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">For You</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
                Relevant updates and campus activity
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Personalized events and announcements, with bigger cards for the updates worth opening first.
              </p>
            </div>
            <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
              View all events
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {feedItems.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                className={`group overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_12px_28px_-24px_rgba(17,24,39,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-24px_rgba(17,24,39,0.28)] ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
              >
                <div className={`relative overflow-hidden bg-gray-100 ${index === 0 ? "h-60" : "h-48"}`}>
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-sm ${
                          item.type === "event"
                            ? "bg-[#ede7f6]/95 text-[#51237f]"
                            : "bg-white/90 text-gray-700"
                        }`}
                      >
                        {item.type === "event" ? "Event" : "Announcement"}
                      </span>
                      <span className="text-xs font-medium text-white/88">{item.clubName}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold leading-tight tracking-[-0.02em] text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-gray-400" />
                      <span>{item.when}</span>
                    </div>
                    <div className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block" />
                    <div className="flex items-center gap-2">
                      <Clock3 size={15} className="text-gray-400" />
                      <span>{item.type === "event" ? "Worth checking" : "Campus update"}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">{item.description}</p>
                  <span className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition group-hover:bg-[#45206b]">
                    {item.cta}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {feedItems.length === 0 ? (
            <article className="mt-5 rounded-[22px] border border-dashed border-gray-300 bg-white p-8 text-center shadow-[0_12px_28px_-24px_rgba(17,24,39,0.18)]">
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
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Explore</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
                Discover what students are opening across campus
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Popular clubs, rising events, and a few things gaining momentum this week.
              </p>
            </div>
            <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
              Browse communities
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exploreItems.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                className={`overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_12px_28px_-24px_rgba(17,24,39,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-24px_rgba(17,24,39,0.28)] ${
                  index === 0
                    ? "md:col-span-2 xl:col-span-2"
                    : index === 1
                      ? "xl:row-span-2"
                      : ""
                }`}
              >
                {item.imageUrl ? (
                  <div
                    className={`relative bg-gray-100 ${
                      index === 0 ? "h-56" : index === 1 ? "h-full min-h-[22rem]" : "h-40"
                    }`}
                  >
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f]">
                        {item.accent || item.type}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-20 items-center border-b border-gray-100 bg-gray-50 px-5">
                    <span className="inline-flex rounded-full bg-[#f4ecfb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f]">
                      {item.accent || item.type}
                    </span>
                  </div>
                )}

                <div className={`p-5 ${index === 1 ? "xl:flex xl:min-h-[15rem] xl:flex-col xl:justify-between" : ""}`}>
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
