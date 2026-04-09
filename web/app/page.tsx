import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
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
        cover_image_url?: string | null;
      }
    | {
        name?: string | null;
        cover_image_url?: string | null;
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

const fallbackEventCover =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop";
const fallbackClubCover =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop";

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
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return time ? `${label} • ${time}` : label;
};

const formatUpdateDate = (value?: string | null) => {
  if (!value) return "Recently";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const derivePostTitle = (value?: string | null) => {
  const content = (value || "").trim();
  if (!content) return "Club update";
  const firstSentence = content.split(/[.!?]/)[0]?.trim() || content;
  return trimText(firstSentence, 58);
};

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [{ data: eventsData }, { data: clubsData }, { data: postsData }, { data: announcementsData }] =
    await Promise.all([
      supabase
        .from("events")
        .select("id, name, description, location, date, day, time, cover_image_url, clubs(name)")
        .eq("approved", true)
        .order("date", { ascending: true, nullsFirst: false })
        .order("day", { ascending: true, nullsFirst: false })
        .limit(8),
      supabase
        .from("clubs")
        .select("id, name, description, member_count, cover_image_url")
        .order("member_count", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .limit(4),
      supabase
        .from("posts")
        .select("id, content, created_at, club_id, clubs(name, cover_image_url)")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("forum_posts")
        .select("id, title, content, created_at, author:author_id(full_name)")
        .eq("category", "announcements")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  const eventIds = (eventsData ?? []).map((event) => event.id);
  const { data: eventRegistrations } = eventIds.length
    ? await supabase.from("event_registrations").select("event_id").in("event_id", eventIds).limit(5000)
    : { data: [] as Array<{ event_id: string }> };

  const registrationCounts = new Map<string, number>();
  for (const row of eventRegistrations ?? []) {
    registrationCounts.set(row.event_id, (registrationCounts.get(row.event_id) ?? 0) + 1);
  }

  const events = (eventsData ?? []).map((event: EventRow) => {
    const club = firstItem(event.clubs);

    return {
      id: event.id,
      title: event.name,
      clubName: club?.name || "Campus Event",
      description: trimText(event.description || event.location || "Campus event update", 120),
      when: formatEventDate(event.date || event.day, event.time),
      location: event.location || "Location TBA",
      cover: event.cover_image_url || fallbackEventCover,
      turnout: getDisplayEventTurnout({
        eventId: event.id,
        eventName: event.name,
        realCount: registrationCounts.get(event.id) ?? 0,
      }),
      href: `/events/${event.id}`,
    };
  });

  const clubs = (clubsData ?? []).map((club: ClubRow) => ({
    id: club.id,
    name: club.name || "Student Club",
    description: trimText(club.description || "Student community", 90),
    members: club.member_count ?? 0,
    cover: club.cover_image_url || fallbackClubCover,
    href: getClubPath(club.id),
  }));

  const updates = [
    ...(postsData ?? []).slice(0, 3).map((post: PostRow) => {
      const club = firstItem(post.clubs);
      return {
        id: `post-${post.id}`,
        title: derivePostTitle(post.content),
        source: club?.name || "Student Club",
        description: trimText(post.content || "New update from campus communities.", 120),
        when: formatUpdateDate(post.created_at),
        href: post.club_id ? getClubPath(post.club_id) : "/clubs",
      };
    }),
    ...(announcementsData ?? []).slice(0, 3).map((announcement: AnnouncementRow) => {
      const author = firstItem(announcement.author);
      return {
        id: `announcement-${announcement.id}`,
        title: announcement.title || "Campus announcement",
        source: author?.full_name || "Montgomery College",
        description: trimText(announcement.content || "New campus note.", 120),
        when: formatUpdateDate(announcement.created_at),
        href: `/announcements/${announcement.id}`,
      };
    }),
  ].slice(0, 4);

  const happeningNow = events[0] ?? null;
  const featuredClubs = clubs.slice(0, 3);
  const comingUp = events.slice(1, 4);
  const featuredNote = updates[0] ?? null;
  const spotlightClub = featuredClubs[0] ?? null;

  const utilityLinks = [
    { label: "Event Registration", href: "/events" },
    { label: "Club Discovery", href: "/clubs" },
    { label: "Campus Help Docs", href: "/docs" },
    { label: "My Activity", href: "/activity" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="relative overflow-hidden border-b border-gray-200 bg-white">
          <div className="absolute inset-x-0 top-0 h-[430px] bg-[linear-gradient(180deg,#ffffff_0%,#f7f3ff_56%,rgba(255,255,255,0.72)_82%,rgba(255,255,255,0)_100%)] md:h-[470px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(81,35,127,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(81,35,127,0.05)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="absolute left-[-10%] top-16 h-64 w-64 rounded-full bg-[#efe7ff] blur-3xl" />
          <div className="absolute right-[-6%] top-0 h-80 w-80 rounded-full bg-[#dbe4ff] blur-3xl" />
          <div className="absolute left-1/2 top-0 hidden h-[430px] w-px bg-[linear-gradient(180deg,transparent,rgba(81,35,127,0.12),transparent)] lg:block md:h-[470px]" />
          <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12 lg:px-8 lg:py-16">
            <div className="grid items-start gap-10 lg:grid-cols-[1.05fr,0.95fr]">
              <div className="pt-2">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#51237f]">
                  Montgomery College campus life
                </p>
                <h1 className="mt-5 max-w-2xl text-[2.8rem] font-semibold tracking-[-0.08em] text-gray-950 md:text-[4.5rem] md:leading-[0.98]">
                  Campus life, designed like a real product.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-gray-600">
                  Find what is happening, discover student organizations, and keep up with campus momentum through
                  one clear home that feels modern instead of institutional.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/events"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-medium text-white transition hover:bg-[#45206b]"
                  >
                    Explore events
                  </Link>
                  <Link
                    href="/clubs"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                  >
                    Browse clubs
                  </Link>
                </div>

                <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] border border-white bg-white/80 p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.24)] backdrop-blur">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400">Upcoming</div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-gray-950">{events.length}</div>
                    <div className="mt-1 text-sm text-gray-500">live events</div>
                  </div>
                  <div className="rounded-[20px] border border-white bg-white/80 p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.24)] backdrop-blur">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400">Featured</div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-gray-950">{featuredClubs.length}</div>
                    <div className="mt-1 text-sm text-gray-500">club picks</div>
                  </div>
                  <div className="rounded-[20px] border border-white bg-white/80 p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.24)] backdrop-blur">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400">Updates</div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-gray-950">{updates.length}</div>
                    <div className="mt-1 text-sm text-gray-500">campus notes</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
                {happeningNow ? (
                  <Link
                    href={happeningNow.href}
                    className="rounded-[28px] border border-white bg-white p-5 shadow-[0_26px_60px_-36px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="rounded-full bg-[#f4ecff] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#51237f]">
                        Happening now
                      </div>
                      <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {happeningNow.turnout} going
                      </div>
                    </div>
                    <div className="mt-4 text-sm font-medium text-[#51237f]">{happeningNow.clubName}</div>
                    <h2 className="mt-2 text-[1.45rem] font-semibold leading-8 tracking-[-0.05em] text-gray-950">
                      {happeningNow.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-gray-600">{happeningNow.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} className="text-gray-400" />
                        {happeningNow.when}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={15} className="text-gray-400" />
                        {happeningNow.location}
                      </span>
                    </div>
                  </Link>
                ) : null}

                <div className="grid gap-4">
                  {featuredNote ? (
                    <Link
                      href={featuredNote.href}
                      className="rounded-[24px] border border-[#dad0ee] bg-[#fbf8ff] p-5 shadow-[0_22px_42px_-34px_rgba(81,35,127,0.36)] transition hover:-translate-y-0.5"
                    >
                      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#51237f]">
                        Campus note
                      </div>
                      <h3 className="mt-3 text-lg font-semibold leading-7 tracking-[-0.04em] text-gray-950">
                        {featuredNote.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{featuredNote.description}</p>
                      <div className="mt-4 text-sm text-gray-500">{featuredNote.when}</div>
                    </Link>
                  ) : null}

                  {spotlightClub ? (
                    <Link
                      href={spotlightClub.href}
                      className="rounded-[24px] border border-[#d7def3] bg-[#f5f8ff] p-5 shadow-[0_22px_42px_-34px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5"
                    >
                      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#3156c8]">
                        Club spotlight
                      </div>
                      <h3 className="mt-3 text-lg font-semibold leading-7 tracking-[-0.04em] text-gray-950">
                        {spotlightClub.name}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{spotlightClub.description}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500">
                        <Users size={15} className="text-gray-400" />
                        {spotlightClub.members} members
                      </div>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#081742] py-12">
          <div className="relative mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <div className="rounded-[22px] bg-white p-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)]">
                <p className="text-sm leading-7 text-gray-600">
                  Connect Camp gives students one place to keep up with campus events, discover organizations,
                  and catch important updates without digging through disconnected tools.
                </p>
                <p className="mt-5 text-sm leading-7 text-gray-600">
                  Use it to find what is happening this week, explore student organizations, and keep up with
                  announcements from across Montgomery College.
                </p>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {updates.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="rounded-[18px] border border-gray-200 p-4 transition hover:border-[#51237f]/20 hover:bg-[#faf9ff]"
                    >
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#51237f]">
                        {item.source}
                      </div>
                      <h3 className="mt-2 text-base font-semibold leading-6 text-gray-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
                      <div className="mt-3 text-xs font-medium text-gray-400">{item.when}</div>
                    </Link>
                  ))}
                </div>
            </div>

            <div className="mt-12">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-[1.7rem] font-medium tracking-[-0.05em] text-white">Featured organizations</h2>
                  <p className="mt-1 text-sm text-white/65">Get involved in student communities on campus.</p>
                </div>
                <Link href="/clubs" className="text-sm font-medium text-white/80 hover:text-white">
                  See more
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {featuredClubs.map((club) => (
                  <Link
                    key={club.id}
                    href={club.href}
                    className="overflow-hidden rounded-[20px] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.45)]"
                  >
                    <div className="relative h-40">
                      <ImageWithFallback src={club.cover} fallbackSrc={fallbackClubCover} alt={club.name} fill className="object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-gray-950">{club.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{club.description}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500">
                        <Users size={15} className="text-gray-400" />
                        {club.members} members
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-[1.7rem] font-medium tracking-[-0.05em] text-white">Coming up</h2>
                    <p className="mt-1 text-sm text-white/65">Events students can step into next.</p>
                  </div>
                  <Link href="/events" className="text-sm font-medium text-white/80 hover:text-white">
                    See more
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {comingUp.map((event) => (
                    <Link
                      key={event.id}
                      href={event.href}
                      className="rounded-[18px] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-28px_rgba(0,0,0,0.45)]"
                    >
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#51237f]">{event.clubName}</div>
                      <h3 className="mt-2 text-base font-semibold leading-6 text-gray-950">{event.title}</h3>
                      <div className="mt-4 space-y-2 text-sm text-gray-500">
                        <div className="inline-flex items-center gap-2">
                          <CalendarDays size={15} className="text-gray-400" />
                          {event.when}
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <Users size={15} className="text-gray-400" />
                          {event.turnout} going
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/8 p-5">
                <h2 className="text-[1.35rem] font-medium tracking-[-0.04em] text-white">Campus notes</h2>
                <div className="mt-4 space-y-3">
                  {updates.slice(0, 3).map((item) => (
                    <Link
                      key={`note-${item.id}`}
                      href={item.href}
                      className="block rounded-[16px] border border-white/10 bg-white/8 p-4 transition hover:bg-white/12"
                    >
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-white/55">{item.source}</div>
                      <h3 className="mt-2 text-sm font-medium leading-6 text-white">{item.title}</h3>
                      <div className="mt-2 text-xs text-white/50">{item.when}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:px-6 lg:grid-cols-[0.8fr,1.2fr] lg:px-8">
            <div className="rounded-[24px] bg-[#eff1f6] p-6">
              <p className="text-sm font-medium text-[#51237f]">Stay connected</p>
              <h2 className="mt-3 text-[1.8rem] font-medium tracking-[-0.05em] text-gray-950">
                Keep campus in your pocket.
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Browse events, discover clubs, and keep up with what is happening from one student-facing home.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/activity"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-medium text-white transition hover:bg-[#45206b]"
                >
                  Open my activity
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-900 transition hover:bg-white"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-[1.8rem] font-medium tracking-[-0.05em] text-gray-950">Campus forms & resources</h2>
                  <p className="mt-1 text-sm text-gray-500">Quick paths into the parts of the platform students actually use.</p>
                </div>
                <Link href="/docs" className="text-sm font-medium text-[#51237f] hover:underline">
                  See more
                </Link>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {utilityLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between rounded-[18px] border border-gray-200 px-4 py-4 text-sm font-medium text-gray-900 transition hover:border-[#51237f]/20 hover:bg-[#faf9ff]"
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
