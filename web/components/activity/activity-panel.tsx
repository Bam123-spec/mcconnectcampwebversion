"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Compass,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import type { PublicClub } from "@/lib/clubs";
import type { EventDetail } from "@/lib/events";
import type { WebSessionProfile } from "@/lib/auth-session";
import type { ActivityMembership } from "@/lib/activity";

type FeedItem =
  | {
      id: string;
      type: "event";
      title: string;
      body: string;
      meta: string;
      href: string;
      cta: string;
      badge: string;
    }
  | {
      id: string;
      type: "membership";
      title: string;
      body: string;
      meta: string;
      href: string;
      cta: string;
      badge: string;
    }
  | {
      id: string;
      type: "discussion";
      title: string;
      body: string;
      meta: string;
      href: string;
      cta: string;
      badge: string;
    };

function SectionHeader({
  eyebrow,
  title,
  description,
  linkHref,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--line-soft)] px-5 py-5 sm:px-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">{eyebrow}</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">{description}</p>
      </div>
      {linkHref && linkLabel ? (
        <Link
          href={linkHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#51237f] transition-colors hover:text-[#421d68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
        >
          {linkLabel}
          <ArrowRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[var(--surface-muted)] text-[#51237f]">
        <Icon size={15} />
      </span>
      <span className="font-semibold text-gray-950">{value}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const icon =
    item.type === "event" ? CalendarDays : item.type === "membership" ? Users : MessageSquare;
  const Icon = icon;

  return (
    <article className="rounded-[22px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[var(--surface-muted)] text-[#51237f]">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--line-soft)] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600">
              {item.badge}
            </span>
            <span className="text-sm text-gray-500">{item.meta}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-gray-950">{item.title}</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">{item.body}</p>
          <div className="mt-4">
            <Link
              href={item.href}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--line-soft)] bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/25 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              {item.cta}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatEventDate = (event: EventDetail) => {
  const parsed = parseLocalDate(event.date);

  if (parsed && !Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return event.day || "Date to be announced";
};

const buildFeed = ({
  hasSession,
  upcomingEvents,
  memberships,
  suggestedClubs,
}: {
  hasSession: boolean;
  upcomingEvents: EventDetail[];
  memberships: ActivityMembership[];
  suggestedClubs: PublicClub[];
}): FeedItem[] => {
  const items: FeedItem[] = [];

  upcomingEvents.slice(0, 3).forEach((event, index) => {
    items.push({
      id: `event-${event.id}`,
      type: "event",
      title: event.name,
      body: hasSession
        ? "Review the timing, open the details, and keep this campus event within reach for the week."
        : "Open the event page to see the schedule, location, and attendance details students usually need.",
      meta: `${formatEventDate(event)}${event.time ? ` • ${event.time}` : ""}`,
      href: `/events/${event.id}`,
      cta: "Open event",
      badge: index === 0 ? "Up next" : "Event reminder",
    });
  });

  memberships.slice(0, 2).forEach((membership) => {
    items.push({
      id: `membership-${membership.id}`,
      type: "membership",
      title: membership.name,
      body:
        membership.role === "Request pending"
          ? "Your request is still in progress. Open the club page when you want to check the status or revisit details."
          : "This is one of the groups already part of your campus life. Use it as a quick return point into the organization.",
      meta: membership.joinedLabel,
      href: `/clubs/${membership.slug}`,
      cta: "Open club",
      badge: membership.role === "Request pending" ? "Membership update" : "Your group",
    });
  });

  suggestedClubs.slice(0, 3).forEach((club) => {
    items.push({
      id: `discussion-${club.id}`,
      type: "discussion",
      title: `${club.name} is worth a closer look`,
      body: `Students exploring ${club.category.toLowerCase()} groups can use this as a quick starting point. Check the club page and decide whether it fits your week.`,
      meta: `${club.campus} • ${club.memberCount} members`,
      href: `/clubs/${club.slug}`,
      cta: "Explore club",
      badge: "Community spotlight",
    });
  });

  return items.slice(0, 6);
};

export function ActivityPanel({
  profile,
  upcomingEvents,
  memberships,
  suggestedClubs,
}: {
  profile: WebSessionProfile | null;
  upcomingEvents: EventDetail[];
  memberships: ActivityMembership[];
  suggestedClubs: PublicClub[];
}) {
  const hasSession = Boolean(profile);
  const upcomingCount = upcomingEvents.length;
  const membershipCount = memberships.length;
  const nextEvent = upcomingEvents[0];
  const highlightedMembership = memberships[0];
  const highlightedSuggestedClub = highlightedMembership ? undefined : suggestedClubs[0];
  const highlightedClubName =
    highlightedMembership?.name ||
    highlightedSuggestedClub?.name ||
    "No community highlighted";
  const highlightedClubMeta = highlightedMembership
    ? highlightedMembership.role
    : highlightedSuggestedClub
      ? `${highlightedSuggestedClub.memberCount} members`
      : "Browse clubs to find active communities";
  const feedItems = buildFeed({ hasSession, upcomingEvents, memberships, suggestedClubs });
  const firstName =
    profile?.full_name?.split(" ").find(Boolean) ||
    profile?.email?.split("@")[0] ||
    "student";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f7fb_0%,#ffffff_18%,#f5f7fb_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[28px] border border-[var(--line-soft)] bg-white px-6 py-7 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:px-8 sm:py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#51237f] shadow-sm">
              <ShieldCheck size={14} />
              Student engagement hub
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              {hasSession ? `Activity for ${firstName}.` : "Campus activity, updates, and discussion starters."}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
              {hasSession
                ? "This is the place to keep up with what is happening around your campus life: event reminders, group updates, and the pages you are most likely to revisit."
                : "Browse the public campus pulse, see what students are engaging with, and sign in when you want your personal activity to appear here."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#51237f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3f1b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
              >
                <CalendarDays className="h-4 w-4" />
                Browse events
              </Link>
              <Link
                href="/clubs"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-soft)] bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#51237f]/25 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
              >
                <Users className="h-4 w-4" />
                Explore clubs
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-soft)] bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#51237f]/25 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
              >
                <Compass className="h-4 w-4" />
                Support and help
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <StatPill label={hasSession ? "your events" : "upcoming events"} value={upcomingCount} icon={CalendarDays} />
              <StatPill label="memberships" value={membershipCount} icon={Users} />
              <StatPill label="community feed" value={feedItems.length} icon={Sparkles} />
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[24px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">At a glance</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">This week</h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] p-4">
                  <div className="text-sm text-gray-500">Next event</div>
                  <div className="mt-1 text-lg font-semibold text-gray-950">
                    {nextEvent?.name || "Nothing scheduled yet"}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">
                    {nextEvent ? formatEventDate(nextEvent) : "Check the events page for upcoming campus activity."}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] p-4">
                  <div className="text-sm text-gray-500">Community focus</div>
                  <div className="mt-1 text-lg font-semibold text-gray-950">{highlightedClubName}</div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">{highlightedClubMeta}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--line-soft)] bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Upcoming</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-950">{upcomingCount}</div>
                </div>
                <div className="rounded-xl border border-[var(--line-soft)] bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Memberships</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-950">{membershipCount}</div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">
                Quick actions
              </p>
              <div className="mt-4 space-y-3">
                <Link
                  href="/events"
                  className="flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/20 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Browse events
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
                <Link
                  href="/clubs"
                  className="flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/20 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Explore clubs
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/20 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Support and help
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
              </div>
            </section>
          </aside>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-8">
            <section className="rounded-[24px] border border-[var(--line-soft)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] overflow-hidden">
              <SectionHeader
                eyebrow="Campus feed"
                title={hasSession ? "Your latest activity" : "Public campus feed"}
                description={
                  hasSession
                    ? "Event reminders, membership updates, and discussion starters collected into one feed."
                    : "A scan-friendly stream of public events, organization spotlights, and discussion prompts."
                }
              />

              <div className="space-y-4 p-4 sm:p-6">
                {feedItems.length > 0 ? (
                  feedItems.map((item) => <FeedCard key={item.id} item={item} />)
                ) : (
                  <div className="rounded-[20px] border border-dashed border-gray-300 bg-[var(--surface-muted)] px-5 py-8 text-center text-sm text-gray-600">
                    {hasSession
                      ? "Activity will appear here as soon as you RSVP to events or connect with clubs."
                      : "Sign in to see your personal campus activity feed."}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-[var(--line-soft)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] overflow-hidden">
              <SectionHeader
                eyebrow="Upcoming"
                title="Event reminders"
                description="A clean list of the campus events most likely to matter next."
                linkHref="/events"
                linkLabel="Browse all events"
              />

              <div className="space-y-4 p-4 sm:p-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 4).map((event) => (
                    <article key={event.id} className="rounded-[20px] border border-[var(--line-soft)] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                        <div className="flex items-start gap-4 lg:min-w-0 lg:flex-1">
                          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[var(--surface-muted)] text-[#51237f]">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                              {formatEventDate(event).split(" ")[0] ?? "Event"}
                            </span>
                            <span className="text-2xl font-semibold leading-none">
                              {formatEventDate(event).match(/\b\d{1,2}\b/)?.[0] ?? "?"}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full border border-[var(--line-soft)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600">
                                Upcoming
                              </span>
                              <span className="text-sm font-medium text-gray-500">
                                {event.clubName || "Campus office"}
                              </span>
                            </div>

                            <h3 className="mt-3 text-xl font-semibold tracking-tight text-gray-950">
                              {event.name}
                            </h3>

                            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                              <div className="flex items-center gap-2">
                                <Clock size={15} className="text-gray-400" />
                                <span>
                                  {formatEventDate(event)} • {event.time || "Time to be announced"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={15} className="text-gray-400" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                          <Link
                            href={`/events/${event.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--line-soft)] bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/25 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                          >
                            View event
                            <ArrowRight size={15} />
                          </Link>
                          <div className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--line-soft)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-gray-600">
                            <Ticket size={15} className="text-[#51237f]" />
                            {event.registrationsCount} attending
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-gray-300 bg-[var(--surface-muted)] px-5 py-8 text-center text-sm text-gray-600">
                    {hasSession
                      ? "No upcoming events are listed yet. Browse events to add one to your week."
                      : "Log in to load your event reminders."}
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[24px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">
                Communities to revisit
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Suggested clubs
              </h2>
              <div className="mt-5 space-y-3">
                {suggestedClubs.slice(0, 4).map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubs/${club.slug}`}
                    className="group flex items-start justify-between gap-4 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] px-4 py-4 text-sm font-semibold text-gray-800 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#51237f]">
                        {club.category}
                      </span>
                      <span className="mt-2 block text-base font-semibold text-gray-950 transition-colors group-hover:text-[#421d68]">
                        {club.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-gray-500">{club.memberCount} members</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-[var(--line-soft)] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-muted)] p-3 text-[#51237f]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#51237f]">
                    Keep it moving
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-950">Useful next actions</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Use this page as a return point into the events, clubs, and support pages you are most likely to revisit.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
