import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  Compass,
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

const isUpcomingEvent = (event: EventDetail, now: Date) => {
  const parsed = parseLocalDate(event.date);
  if (!parsed) return true;
  parsed.setHours(23, 59, 59, 999);
  return parsed >= now;
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">{description}</p>
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
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
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
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
  const upcomingEvents = getUpcomingEvents(events);
  const featuredClubs = getFeaturedClubs(clubsResult.clubs);
  const firstName =
    profile?.full_name?.split(" ").find(Boolean) ||
    profile?.email?.split("@")[0] ||
    "Raptors";

  const heroMetrics = [
    { label: "Events live", value: String(events.length) },
    { label: "Active clubs", value: String(clubsResult.totalCount) },
    { label: "Campus resources", value: String(CAMPUS_RESOURCES.length) },
  ];

  return (
    <div className="min-h-screen bg-[var(--page-background)]">
      <section className="bg-[var(--page-background)]">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(81,35,127,0.08),transparent_34%),radial-gradient(circle_at_right,rgba(15,23,42,0.04),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:px-8 lg:py-16">
            <div className="relative z-10 flex flex-col justify-center lg:pt-4">
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-tight text-gray-950 sm:text-5xl lg:text-[4rem]">
                {isAuthenticated ? `Welcome back, ${firstName}.` : "Welcome to RaptorConnect!"}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                A modern hub for events, student organizations, and campus resources.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#470A68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3C0957] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  Browse events
                </Link>
                <Link
                  href={isAuthenticated ? "/activity" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line-soft)] bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-[rgba(71,10,104,0.30)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  {isAuthenticated ? <BellRing className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isAuthenticated ? "Open my activity" : "Sign in"}
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3 border-t border-[var(--line-soft)] pt-6">
                {heroMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm text-gray-700 shadow-sm"
                  >
                    <span className="font-semibold text-gray-950">{metric.value}</span>
                    <span className="ml-2 text-gray-500">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 self-start lg:pt-14 lg:pr-3">
              <Image
                src="/hero-preview-v2.png"
                alt="RaptorConnect app preview"
                width={1356}
                height={1028}
                priority
                className="block h-auto w-full max-w-[560px]"
              />
            </div>
        </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6 md:py-4 lg:px-8">
        <section className="grid gap-8 md:grid-cols-3">
          <article className="border-t border-[var(--line-soft)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Events</p>
            <h2 className="mt-3 text-xl font-semibold text-gray-950">Plan the week ahead</h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-gray-600">
              See what is happening across campus and move directly to the event page that matters.
            </p>
            <Link
              href="/events"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            >
              Open events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
          <article className="border-t border-[var(--line-soft)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Organizations</p>
            <h2 className="mt-3 text-xl font-semibold text-gray-950">Find your communities</h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-gray-600">
              Browse active groups by interest, campus, and meeting schedule without hunting through clutter.
            </p>
            <Link
              href="/clubs"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            >
              Explore clubs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
          <article className="border-t border-[var(--line-soft)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Resources</p>
            <h2 className="mt-3 text-xl font-semibold text-gray-950">Open official campus links fast</h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-gray-600">
              Keep the high-traffic Montgomery College tools one tap away from the homepage.
            </p>
            <Link
              href="/docs"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            >
              Support &amp; help
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </section>

        <section className="mt-16">
          <SectionHeader
            eyebrow="What’s coming up"
            title="Upcoming events"
            description="A compact preview of the next campus events students are most likely to open and act on."
            href="/events"
            linkLabel="See the full calendar"
          />

          <div className="mt-8">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} authEnabled={false} variant="compact" />
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
        </section>

        <section className="mt-16">
          <SectionHeader
            eyebrow="Active communities"
            title="Clubs students are joining"
            description="A tighter view of the organizations that are active right now, with a clearer identity for each one."
            href="/clubs"
            linkLabel="Browse all clubs"
          />

          {featuredClubs.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredClubs.map((club) => (
                <Link
                  key={club.id}
                  href={`/clubs/${club.slug}`}
                  className="group rounded-[24px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] transition hover:border-[rgba(71,10,104,0.25)] hover:shadow-[0_14px_30px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-snug text-gray-950 transition-colors group-hover:text-[var(--primary)]">
                        {club.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{club.category}</p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] text-sm font-semibold text-[var(--primary)]">
                      {club.initials}
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
                    {club.description || "An active student organization open to new members."}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs font-medium text-gray-500">
                    <span>{club.campus}</span>
                    <span>{club.memberCount} members</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                title="No clubs are published yet"
                description="Once club listings are available in Supabase, they will appear here automatically."
                actionHref="/clubs"
                actionLabel="Open clubs"
              />
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
