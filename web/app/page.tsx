import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  Clock,
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
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  return event?.day || "Date to be announced";
};

const formatCompactDate = (event?: EventDetail | null) => {
  const parsed = parseLocalDate(event?.date);

  if (parsed) {
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return event?.day || "TBA";
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

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">{description}</p>
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#51237f] transition-colors hover:text-[#421d68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

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
  const firstName =
    profile?.full_name?.split(" ").find(Boolean) ||
    profile?.email?.split("@")[0] ||
    "Raptors";

  const heroMetrics = [
    { label: "Events live", value: String(events.length) },
    { label: "Active clubs", value: String(clubsResult.totalCount) },
    { label: "Account", value: isAuthenticated ? "Connected" : "Sign in" },
  ];
  const topClubs = featuredClubs.slice(0, 3);
  const topEvents = upcomingEvents.slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--page-background)]">
      <section className="border-b border-[var(--line-soft)] bg-[var(--page-background)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:py-10 xl:grid-cols-[minmax(0,1.28fr)_400px] lg:px-8 lg:py-12">
          <div className="overflow-hidden rounded-[32px] border border-[var(--line-soft)] bg-[#1f1830] text-white shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
            <div className="relative">
              <div className="absolute inset-0">
                <Image
                  src="/montgomery-college-campus.jpg"
                  alt="Montgomery College campus entrance"
                  fill
                  priority
                  className="object-cover opacity-28"
                  sizes="(min-width: 1024px) 70vw, 100vw"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(81,35,127,0.82),rgba(17,24,39,0.9))]" />

              <div className="relative px-7 py-9 sm:px-9 sm:py-10 lg:px-11 lg:py-12">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
                  Montgomery College student portal
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  {isAuthenticated ? `Welcome back, ${firstName}.` : "The student home for events, clubs, and campus activity."}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-white/88 sm:text-lg">
                  Raptor Connect is Montgomery College&apos;s front door for student life. Check what is happening next, see which organizations are active, and open the campus tools students use every day.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/events"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1830]"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Browse events
                  </Link>
                  <Link
                    href={isAuthenticated ? "/activity" : "/login"}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1830]"
                  >
                    {isAuthenticated ? <BellRing className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                    {isAuthenticated ? "Open my activity" : "Sign in"}
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
                  {heroMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm">
                      <div className="text-2xl font-semibold text-white">{metric.value}</div>
                      <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                          Upcoming on campus
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">What students can open next</h2>
                      </div>
                      <Link
                        href="/events"
                        className="hidden rounded-lg border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1830] md:inline-flex"
                      >
                        All events
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {topEvents.length > 0 ? (
                        topEvents.map((event) => (
                          <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="rounded-2xl border border-white/12 bg-black/15 px-4 py-4 transition hover:bg-black/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1830]"
                          >
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                              {formatCompactDate(event)}
                            </div>
                            <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-white">
                              {event.name}
                            </h3>
                            <div className="mt-3 flex items-center gap-2 text-sm text-white/72">
                              <Clock className="h-4 w-4 shrink-0" />
                              <span className="line-clamp-1">{(event.time || "TBA").split(" - ")[0]}</span>
                            </div>
                            <div className="mt-1 text-sm text-white/65">{event.clubName || "Campus event"}</div>
                          </Link>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/18 bg-black/10 px-4 py-8 text-sm text-white/72 md:col-span-3">
                          Upcoming events will appear here when they are published.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/12 bg-black/18 p-5 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                      Platform at a glance
                    </p>
                    <div className="mt-5 space-y-4">
                      <div>
                        <div className="text-sm text-white/65">Featured event</div>
                        <div className="mt-1 text-lg font-semibold text-white">
                          {featuredEvent?.name || "No featured event yet"}
                        </div>
                        <div className="mt-1 text-sm text-white/65">
                          {formatHeroDate(featuredEvent)}
                        </div>
                      </div>

                      <div className="border-t border-white/12 pt-4">
                        <div className="text-sm text-white/65">Active clubs right now</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {topClubs.length > 0 ? (
                            topClubs.map((club) => (
                              <Link
                                key={club.id}
                                href={`/clubs/${club.slug}`}
                                className="rounded-full border border-white/14 bg-white/8 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1830]"
                              >
                                {club.name}
                              </Link>
                            ))
                          ) : (
                            <span className="text-sm text-white/65">Club listings will appear here.</span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={isAuthenticated ? "/activity" : "/login"}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1830]"
                      >
                        {isAuthenticated ? "Go to my activity" : "Connect my account"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="ui-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">Campus activity</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">What this platform does</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] px-4 py-4">
                  <div className="text-sm font-semibold text-gray-950">Upcoming events</div>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Browse approved campus events and open the details that matter before you RSVP.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] px-4 py-4">
                  <div className="text-sm font-semibold text-gray-950">Active clubs</div>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Find student organizations by interest, campus, and meeting schedule.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] px-4 py-4">
                  <div className="text-sm font-semibold text-gray-950">Personal activity</div>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Sign in to track your RSVPs, memberships, and the pages you need to reopen.
                  </p>
                </div>
              </div>
            </div>

            <div className="ui-muted-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">Quick start</p>
              <div className="mt-4 space-y-3">
                <Link
                  href="/clubs"
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#51237f]/30 hover:bg-[#fcfbfe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Explore student clubs
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#51237f]/30 hover:bg-[#fcfbfe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Support and help
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  href={isAuthenticated ? "/activity" : "/login"}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#51237f]/30 hover:bg-[#fcfbfe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  {isAuthenticated ? "Open my dashboard" : "Connect my account"}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="ui-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">Events</p>
            <h2 className="mt-3 text-xl font-semibold text-gray-950">Plan the week ahead</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              See what is happening across campus and move directly to the event page that matters.
            </p>
          </div>
          <div className="ui-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">Organizations</p>
            <h2 className="mt-3 text-xl font-semibold text-gray-950">Find your communities</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Browse active groups by interest, campus, and meeting schedule without hunting through clutter.
            </p>
          </div>
          <div className="ui-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">Resources</p>
            <h2 className="mt-3 text-xl font-semibold text-gray-950">Open official campus links fast</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Keep the high-traffic Montgomery College tools one tap away from the homepage.
            </p>
          </div>
        </section>

        <section className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div>
            <SectionHeader
              eyebrow="What’s coming up"
              title="Upcoming events"
              description="A clean list of the next campus events students are most likely to open and act on."
              href="/events"
              linkLabel="See the full calendar"
            />

            <div className="mt-8">
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
          </div>

          <aside className="ui-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">Community pulse</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Active clubs</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Popular organizations students are already joining and revisiting.
            </p>

            {featuredClubs.length > 0 ? (
              <div className="mt-6 space-y-3">
                {featuredClubs.map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubs/${club.slug}`}
                    className="block rounded-xl border border-[var(--line-soft)] bg-white px-4 py-4 transition hover:border-[#51237f]/30 hover:bg-[#faf8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold leading-snug text-gray-950">{club.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{club.category}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
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
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm leading-6 text-gray-600">
                Approved clubs from Supabase will appear here when available.
              </div>
            )}

            <Link
              href="/clubs"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[#51237f] hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              Browse all clubs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </section>

        <section className="mt-14">
          <SectionHeader
            eyebrow="Official links"
            title="Campus resources students actually use"
            description="These links open official Montgomery College services and keep the essentials close to the student homepage."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CAMPUS_RESOURCES.map((resource) => {
              const Icon = resource.icon;

              return (
                <Link
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group ui-surface ui-surface-hover p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
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
