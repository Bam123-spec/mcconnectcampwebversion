import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock3, Search, Sparkles } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";

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

  const [{ data: eventsData }, { data: announcementsData }] = await Promise.all([
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
  ]);

  const upcomingEvents = (eventsData ?? []).slice(0, 6).map((event: EventRow) => {
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

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
        <section className="border-b border-gray-200 pb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">
            Montgomery College Campus Life
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] text-gray-950 md:text-5xl">
            Discover what&apos;s happening across campus.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Find events, follow club updates, and keep up with announcements in one clean feed.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <form action="/events" className="relative flex-1">
              <label htmlFor="homepage-search" className="sr-only">
                Search campus events
              </label>
              <Search
                aria-hidden="true"
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="homepage-search"
                type="text"
                name="q"
                placeholder="Search events or clubs"
                className="h-12 w-full rounded-full border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
              />
            </form>
            <Link
              href="/events"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#51237f] px-6 text-sm font-semibold text-white transition hover:bg-[#45206b]"
            >
              Browse Events
            </Link>
          </div>
        </section>

        <section className="pt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Upcoming Events</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
                This week on campus
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
                  className="w-[280px] shrink-0 rounded-[24px] border border-gray-200 bg-white p-4 shadow-[0_10px_28px_-22px_rgba(17,24,39,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-24px_rgba(17,24,39,0.45)]"
                >
                  <div className="relative h-36 overflow-hidden rounded-[18px] bg-gray-100">
                    <Image src={event.cover} alt={event.title} fill className="object-cover" />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#51237f]">
                      {event.clubName}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-tight text-gray-950">{event.title}</h3>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays size={15} className="text-gray-400" />
                      <span>{event.when}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Campus Feed</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
              Events and announcements in one place
            </h2>
          </div>

          <div className="space-y-4">
            {feedItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_10px_24px_-24px_rgba(17,24,39,0.35)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                          item.type === "event"
                            ? "bg-[#f4ecfb] text-[#51237f]"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.type === "event" ? (
                          <>
                            <Sparkles size={12} className="mr-1.5" />
                            Event
                          </>
                        ) : (
                          "Announcement"
                        )}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold tracking-[-0.02em] text-gray-950">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-[#51237f]">{item.clubName}</p>

                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <Clock3 size={15} className="text-gray-400" />
                      <span>{item.when}</span>
                    </div>

                    <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600">{item.description}</p>
                  </div>

                  <div className="md:pl-6">
                    <Link
                      href={item.href}
                      className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                        item.type === "event"
                          ? "bg-[#51237f] text-white hover:bg-[#45206b]"
                          : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {item.cta}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
