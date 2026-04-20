import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  Compass,
  ExternalLink,
  Library,
  LogIn,
  Map,
  ShieldAlert,
  Users,
} from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { getCurrentProfile } from "@/lib/auth-session";
import { getPublicClubs, type PublicClub } from "@/lib/clubs";
import { getPublicEvents, type EventDetail } from "@/lib/events";

const CAMPUS_RESOURCES = [
  {
    id: "mymc",
    name: "MyMC Portal",
    description: "Access student services, registration, billing, and campus tools.",
    url: "https://mymc.montgomerycollege.edu/",
    icon: Compass,
  },
  {
    id: "blackboard",
    name: "Blackboard Support",
    description: "Get help with course access, assignments, and online learning tools.",
    url: "https://info.montgomerycollege.edu/offices/information-technology/blackboard-support.html",
    icon: BookOpen,
  },
  {
    id: "library",
    name: "MC Libraries",
    description: "Find research help, databases, study spaces, and library hours.",
    url: "https://library.montgomerycollege.edu/",
    icon: Library,
  },
  {
    id: "maps",
    name: "Campus Maps",
    description: "Locate buildings, rooms, parking, and services across campuses.",
    url: "https://www.montgomerycollege.edu/about-mc/campuses-and-locations/",
    icon: Map,
  },
  {
    id: "raptor-central",
    name: "Raptor Central",
    description: "Get help with admissions, financial aid, records, and payments.",
    url: "https://www.montgomerycollege.edu/welcomecenter",
    icon: Users,
  },
  {
    id: "mc-alert",
    name: "MC Alert",
    description: "Review emergency alerts and campus safety communication.",
    url: "https://www.montgomerycollege.edu/offices/public-safety-health-emergency-management/public-safety/mc-alert.html",
    icon: ShieldAlert,
  },
];

export const dynamic = "force-dynamic";

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatHeroDate = (event?: EventDetail | null) => {
  const parsed = parseLocalDate(event?.date);

  if (parsed) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  return event?.day || "Date to be announced";
};

const isUpcomingEvent = (event: EventDetail, now: Date) => {
  const parsed = parseLocalDate(event.date);
  if (!parsed) return true;
  parsed.setHours(23, 59, 59, 999);
  return parsed >= now;
};

const getFeaturedEvent = (events: EventDetail[]) => {
  const now = new Date();
  const upcoming = events.filter((event) => isUpcomingEvent(event, now));

  return [...upcoming].sort((a, b) => {
    if (a.isRegistered !== b.isRegistered) return a.isRegistered ? -1 : 1;
    const registrationDelta = (b.registrationsCount || 0) - (a.registrationsCount || 0);
    if (registrationDelta !== 0) return registrationDelta;
    return (parseLocalDate(a.date)?.getTime() ?? Number.POSITIVE_INFINITY) -
      (parseLocalDate(b.date)?.getTime() ?? Number.POSITIVE_INFINITY);
  })[0] ?? events[0] ?? null;
};

const getUpcomingEvents = (events: EventDetail[]) => {
  const now = new Date();
  return events
    .filter((event) => isUpcomingEvent(event, now))
    .sort((a, b) => {
      const aTime = parseLocalDate(a.date)?.getTime() ?? Number.POSITIVE_INFINITY;
      const bTime = parseLocalDate(b.date)?.getTime() ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })
    .slice(0, 3);
};

const getFeaturedClubs = (clubs: PublicClub[]) =>
  [...clubs]
    .sort((a, b) => {
      const memberDelta = b.memberCount - a.memberCount;
      if (memberDelta !== 0) return memberDelta;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 4);

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-gray-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">{description}</p>
      <Link
        href={actionHref}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#51237f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f1b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default async function Home() {
  const [profile, events, clubsResult] = await Promise.all([
    getCurrentProfile(),
    getPublicEvents(),
    getPublicClubs({ limit: 18 }),
  ]);
  const isAuthenticated = Boolean(profile);
  const featuredEvent = getFeaturedEvent(events);
  const upcomingEvents = getUpcomingEvents(events);
  const featuredClubs = getFeaturedClubs(clubsResult.clubs);
  const heroMetrics = [
    { label: "Campus events", value: String(events.length) },
    { label: "Student groups", value: String(clubsResult.totalCount) },
    { label: "RSVP status", value: isAuthenticated ? "Connected" : "Login" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f5]">
      <section className="relative overflow-hidden border-b border-gray-200 bg-black text-white">
        <Image
          src="/montgomery-college-campus.jpg"
          alt="Montgomery College campus entrance"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/75" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-end">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-black/30 px-3 py-2 text-xs font-semibold uppercase text-white">
                Montgomery College student life
              </div>

              <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-none text-white md:text-6xl lg:text-7xl">
                Welcome, Raptors.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
                Start with what students actually need: what is happening next,
                where to get help, and which communities are active right now.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <CalendarDays className="h-4 w-4" />
                  See upcoming events
                </Link>
                <Link
                  href={isAuthenticated ? "/activity" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-black/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {isAuthenticated ? <BellRing className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isAuthenticated ? "Open my activity" : "Log in for my activity"}
                </Link>
              </div>
            </div>

            <div className="border-l-4 border-white/70 bg-black/35 px-6 py-5 backdrop-blur-sm">
              <div className="text-xs font-semibold uppercase text-white/70">Recommended next</div>
              <Link
                href={featuredEvent ? `/events/${featuredEvent.id}` : "/events"}
                className="mt-2 block rounded-md text-2xl font-semibold leading-tight text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {featuredEvent?.name || "No upcoming event is listed yet"}
              </Link>
              <div className="mt-4 space-y-2 text-sm text-white/80">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-white" />
                  <span>{formatHeroDate(featuredEvent)}</span>
                </div>
                <div>{featuredEvent?.location || "Check back soon"}</div>
                <div>{featuredEvent?.clubName || "Campus events"}</div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 border-t border-white/25 pt-5 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="border-l border-white/35 pl-4">
                <div className="text-2xl font-semibold text-white">{metric.value}</div>
                <div className="mt-1 text-xs font-medium uppercase text-white/70">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#51237f]">
                  Plan your week
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-950">Upcoming events</h2>
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#51237f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
              >
                View all events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} authEnabled={false} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming events are published"
                description="When approved campus events are added in Supabase, they will appear here automatically."
                actionHref="/events"
                actionLabel="Open events"
              />
            )}
          </div>

          <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#51237f]">
                  Communities
                </p>
                <h2 className="mt-2 text-xl font-semibold text-gray-950">Active clubs</h2>
              </div>
              <Users className="h-5 w-5 text-[#51237f]" />
            </div>

            {featuredClubs.length > 0 ? (
              <div className="mt-5 space-y-3">
                {featuredClubs.map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubs/${club.slug}`}
                    className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-[#51237f]/40 hover:bg-[#faf8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-snug text-gray-950">{club.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{club.category}</p>
                      </div>
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        {club.initials}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-medium text-gray-500">
                      <span>{club.campus}</span>
                      <span>{club.memberCount} members</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm leading-6 text-gray-600">
                Approved clubs from Supabase will appear here when available.
              </div>
            )}

            <Link
              href="/clubs"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[#51237f] hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              Browse all clubs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </section>

        <section className="mt-12">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#51237f]">
              Student resources
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-950">Campus links students actually use</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              These links leave Connect Camp and open official Montgomery College services.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CAMPUS_RESOURCES.map((resource) => {
              const Icon = resource.icon;

              return (
                <Link
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#51237f]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[#51237f]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 transition group-hover:text-[#51237f]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-950">{resource.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{resource.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
