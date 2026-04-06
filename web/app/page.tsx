import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarDays, MapPin, Users } from "lucide-react";
import { getDisplayEventTurnout } from "@/lib/demo-analytics";
import { getClubPath } from "@/lib/club-utils";
import { createServerSupabaseClient } from "@/lib/supabase";

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

type ClubRow = {
  id: string;
  name?: string | null;
  description?: string | null;
  member_count?: number | null;
  cover_image_url?: string | null;
};

type PostRow = {
  id: string;
  content?: string | null;
  created_at?: string | null;
  club_id?: string | null;
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
  author?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

type HomeEventCard = {
  id: string;
  title: string;
  clubName: string;
  when: string;
  location: string;
  description: string;
  cover: string;
  turnout: number;
  href: string;
};

type HomeClubCard = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  cover: string;
  href: string;
};

type UpdateItem = {
  id: string;
  type: "post" | "announcement";
  title: string;
  source: string;
  when: string;
  sortAt: string | null;
  description: string;
  href: string;
};

const fallbackEventCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";
const fallbackClubCover =
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600&auto=format&fit=crop";

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const trimText = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength).trim()}…` : value;

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

const formatUpdateDate = (value?: string | null) => {
  if (!value) return "Recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const derivePostTitle = (value?: string | null) => {
  const content = (value || "").trim();
  if (!content) return "Club update";

  const firstSentence = content.split(/[.!?]/)[0]?.trim() || content;
  return trimText(firstSentence, 72);
};

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [{ data: eventsData }, { data: clubsData }, { data: postsData }, { data: announcementsData }] =
    await Promise.all([
      supabase
        .from("events")
        .select("id, name, description, location, date, day, time, cover_image_url, clubs(name)")
        .order("date", { ascending: true, nullsFirst: false })
        .order("day", { ascending: true, nullsFirst: false })
        .limit(6),
      supabase
        .from("clubs")
        .select("id, name, description, member_count, cover_image_url")
        .order("member_count", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .limit(3),
      supabase
        .from("posts")
        .select("id, content, created_at, club_id, clubs(name)")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("forum_posts")
        .select("id, title, content, created_at, author:author_id(full_name)")
        .eq("category", "announcements")
        .order("created_at", { ascending: false })
        .limit(4),
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

  const featuredEvents: HomeEventCard[] = (eventsData ?? []).slice(0, 3).map((event: EventRow) => {
    const club = firstItem(event.clubs);

    return {
      id: event.id,
      title: event.name,
      clubName: club?.name || "Campus Event",
      when: formatEventDate(event.date || event.day, event.time),
      location: event.location || "Location TBA",
      description: trimText(event.description || event.location || "Campus event update", 120),
      cover: event.cover_image_url || fallbackEventCover,
      turnout: getDisplayEventTurnout({
        eventId: event.id,
        eventName: event.name,
        realCount: registrationCounts.get(event.id) ?? 0,
      }),
      href: `/events/${event.id}`,
    };
  });

  const featuredClubs: HomeClubCard[] = (clubsData ?? []).map((club: ClubRow) => ({
    id: club.id,
    name: club.name || "Student Club",
    description: trimText(club.description || "Montgomery College student community", 110),
    memberCount: club.member_count ?? 0,
    cover: club.cover_image_url || fallbackClubCover,
    href: getClubPath(club.id),
  }));

  const postUpdates: UpdateItem[] = (postsData ?? []).map((post: PostRow) => {
    const club = firstItem(post.clubs);

    return {
      id: `post-${post.id}`,
      type: "post",
      title: derivePostTitle(post.content),
      source: club?.name || "Student Club",
      when: formatUpdateDate(post.created_at),
      sortAt: post.created_at || null,
      description: trimText(post.content || "New club update available.", 180),
      href: post.club_id ? getClubPath(post.club_id) : "/clubs",
    };
  });

  const announcementUpdates: UpdateItem[] = (announcementsData ?? []).map((announcement: AnnouncementRow) => {
    const author = firstItem(announcement.author);

    return {
      id: `announcement-${announcement.id}`,
      type: "announcement",
      title: announcement.title || "Campus announcement",
      source: author?.full_name || "Montgomery College",
      when: formatUpdateDate(announcement.created_at),
      sortAt: announcement.created_at || null,
      description: trimText(announcement.content || "New announcement for the campus community.", 180),
      href: `/announcements/${announcement.id}`,
    };
  });

  const updates = [...postUpdates, ...announcementUpdates]
    .sort((left, right) => {
      const leftTime = left.sortAt ? new Date(left.sortAt).getTime() : 0;
      const rightTime = right.sortAt ? new Date(right.sortAt).getTime() : 0;
      return rightTime - leftTime;
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
        <section className="border-b border-gray-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Home</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950 md:text-4xl">
            Campus events, clubs, and club movement.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
            Keep the home tab focused on what students can do next and what clubs are posting right now.
          </p>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Events</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">3 upcoming events</h2>
            </div>
            <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
              See all events
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <Link
                key={event.id}
                href={event.href}
                className="group overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_14px_34px_-26px_rgba(17,24,39,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-24px_rgba(17,24,39,0.26)]"
              >
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <Image src={event.cover} alt={event.title} fill className="object-cover transition duration-500 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-sm font-medium text-white/88">{event.clubName}</p>
                    <h3 className="mt-2 text-2xl font-bold leading-tight text-white">{event.title}</h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-gray-400" />
                      <span>{event.when}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-gray-400" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">{event.description}</p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#51237f]">
                      <Users size={15} />
                      {event.turnout} going
                    </span>
                    <span className="inline-flex h-10 items-center justify-center rounded-full bg-[#51237f] px-4 text-sm font-semibold text-white transition group-hover:bg-[#45206b]">
                      View event
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Clubs</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">3 active communities</h2>
            </div>
            <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
              Browse clubs
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {featuredClubs.map((club) => (
              <Link
                key={club.id}
                href={club.href}
                className="group overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_14px_34px_-26px_rgba(17,24,39,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-24px_rgba(17,24,39,0.26)]"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <Image src={club.cover} alt={club.name} fill className="object-cover transition duration-500 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-2xl font-bold leading-tight text-white">{club.name}</h3>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm leading-6 text-gray-600">{club.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#51237f]">
                      <Users size={15} />
                      {club.memberCount} members
                    </span>
                    <span className="text-sm font-semibold text-gray-900">View club</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Movement</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
                Club posts and announcements
              </h2>
            </div>
            <Link href="/announcements" className="text-sm font-semibold text-[#51237f] hover:underline">
              Open updates
            </Link>
          </div>

          <div className="space-y-4">
            {updates.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(17,24,39,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-24px_rgba(17,24,39,0.24)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                          item.type === "post" ? "bg-[#f4ecfb] text-[#51237f]" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.type === "post" ? "Club Post" : "Announcement"}
                      </span>
                      <span className="text-sm font-medium text-gray-500">{item.source}</span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold leading-tight text-gray-950">{item.title}</h3>
                    <p className="mt-2 text-sm font-medium text-gray-500">{item.when}</p>
                    <p className="mt-4 text-sm leading-6 text-gray-600">{item.description}</p>
                  </div>

                  <span className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
                    <Bell size={15} className="text-[#51237f]" />
                    Open
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
