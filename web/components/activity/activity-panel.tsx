"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Compass,
  MessageSquare,
  Megaphone,
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
    <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">{eyebrow}</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>
      </div>
      {linkHref && linkLabel ? (
        <Link
          href={linkHref}
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#51237f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
        >
          {linkLabel}
          <ArrowRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}

function SummaryChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#f3eef8] p-2 text-[#51237f]">
          <Icon size={16} />
        </div>
        <div>
          <div className="text-xl font-semibold text-gray-950">{value}</div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const icon =
    item.type === "event"
      ? CalendarDays
      : item.type === "membership"
        ? Users
        : MessageSquare;
  const Icon = icon;

  return (
    <article className="ui-surface p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-[#f3eef8] p-3 text-[#51237f]">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600">
              {item.badge}
            </span>
            <span className="text-sm text-gray-500">{item.meta}</span>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-gray-950">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-gray-600">{item.body}</p>
          <div className="mt-5">
            <Link
              href={item.href}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/30 hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
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

const formatEventDate = (event: EventDetail) => {
  if (event.date) {
    const [year, month, day] = event.date.split("T")[0].split("-").map(Number);
    const parsed = year && month && day ? new Date(year, month - 1, day) : null;
    if (parsed && !Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
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
        ? `You have campus activity coming up. Review the event details, confirm the time, and keep it on your radar for the week.`
        : `This is one of the campus events students can browse right now. Open it to see the schedule, location, and attendance details.`,
      meta: `${formatEventDate(event)}${event.time ? ` • ${event.time}` : ""}`,
      href: `/events/${event.id}`,
      cta: "Open event",
      badge: index === 0 ? "Up next" : "Event update",
    });
  });

  memberships.slice(0, 2).forEach((membership) => {
    items.push({
      id: `membership-${membership.id}`,
      type: "membership",
      title: membership.name,
      body:
        membership.role === "Request pending"
          ? "Your membership request is still in progress. Reopen the club page to check details and next steps."
          : "This organization is part of your campus network. Use it as a quick return point into the clubs you are connected with.",
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
      body: `Students exploring ${club.category.toLowerCase()} groups can use this as a discussion starter. Check the club page, look at meeting details, and decide whether it fits your week.`,
      meta: `${club.campus} • ${club.memberCount} members`,
      href: `/clubs/${club.slug}`,
      cta: "Explore discussion",
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
    <div className="min-h-screen bg-[var(--page-background)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_380px]">
          <section className="overflow-hidden rounded-[30px] border border-[var(--line-soft)] bg-[#1f1830] text-white shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
            <div className="relative">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(81,35,127,0.94),rgba(17,24,39,0.9))]" />
              <div className="relative px-7 py-8 sm:px-9 sm:py-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88">
                  <ShieldCheck size={14} />
                  Student engagement hub
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  {hasSession ? `Activity for ${firstName}.` : "Campus activity, updates, and discussion starters."}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-white/86">
                  {hasSession
                    ? "This is the place to keep up with what is happening around your campus life: event reminders, group updates, and the pages you are most likely to revisit."
                    : "Browse the public campus pulse, see what students are engaging with, and sign in when you want your personal activity to appear here."}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <SummaryChip label={hasSession ? "your events" : "upcoming events"} value={upcomingCount} icon={CalendarDays} />
                  <SummaryChip label="memberships" value={membershipCount} icon={Users} />
                  <SummaryChip label="community feed" value={feedItems.length} icon={Sparkles} />
                </div>

                <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                          Live feed
                        </div>
                        <h2 className="mt-2 text-2xl font-semibold text-white">What feels current right now</h2>
                      </div>
                      <Megaphone className="h-5 w-5 text-white/80" />
                    </div>

                    <div className="mt-5 space-y-3">
                      {feedItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/12 bg-black/15 px-4 py-4"
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68">
                            {item.badge}
                          </div>
                          <div className="mt-2 text-lg font-semibold text-white">{item.title}</div>
                          <div className="mt-2 text-sm leading-6 text-white/74">{item.meta}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/12 bg-black/18 p-5 backdrop-blur-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                      Student pulse
                    </div>
                    <div className="mt-5 space-y-4">
                      <div>
                        <div className="text-sm text-white/65">Next event</div>
                        <div className="mt-1 text-lg font-semibold text-white">
                          {nextEvent?.name || "No event on deck yet"}
                        </div>
                        <div className="mt-1 text-sm text-white/65">
                          {nextEvent ? formatEventDate(nextEvent) : "Check events for upcoming activity"}
                        </div>
                      </div>

                      <div className="border-t border-white/12 pt-4">
                        <div className="text-sm text-white/65">Current club focus</div>
                        <div className="mt-1 text-lg font-semibold text-white">{highlightedClubName}</div>
                        <div className="mt-1 text-sm text-white/65">{highlightedClubMeta}</div>
                      </div>

                      <Link
                        href={hasSession ? "/events" : "/login"}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1830]"
                      >
                        {hasSession ? "Open events" : "Sign in for my feed"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="ui-surface p-6">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">
                Engagement lane
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Easy ways back in
              </h2>
              <div className="mt-5 space-y-3">
                <Link
                  href="/events"
                  className="flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Browse events
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
                <Link
                  href="/clubs"
                  className="flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Explore clubs
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Support and help
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
              </div>
            </section>

            <section className="ui-muted-panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">
                    Quick snapshot
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                    This week
                  </h2>
                </div>
                <Compass className="h-5 w-5 text-[#51237f]" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-white/80 bg-white p-4">
                  <div className="text-sm text-gray-500">Next event</div>
                  <div className="mt-2 text-lg font-semibold text-gray-950">
                    {nextEvent?.name || "Nothing scheduled yet"}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {nextEvent ? formatEventDate(nextEvent) : "Check the events page for upcoming campus activity."}
                  </p>
                </div>

                <div className="rounded-xl border border-white/80 bg-white p-4">
                  <div className="text-sm text-gray-500">Community focus</div>
                  <div className="mt-2 text-lg font-semibold text-gray-950">{highlightedClubName}</div>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {hasSession
                      ? "Use your memberships and suggestions here as quick return points into campus life."
                      : "Sign in to turn this public feed into a personal engagement hub."}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-8">
            <section className="ui-surface overflow-hidden">
              <SectionHeader
                eyebrow="Campus feed"
                title={hasSession ? "Your latest activity" : "Public campus feed"}
                description={
                  hasSession
                    ? "Event reminders, membership updates, and discussion starters collected into one feed."
                    : "A scan-friendly stream of public events, organization spotlights, and discussion prompts."
                }
              />

              <div className="space-y-5 p-4 sm:p-6">
                {feedItems.length > 0 ? (
                  feedItems.map((item) => <FeedCard key={item.id} item={item} />)
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-gray-600">
                    {hasSession
                      ? "Activity will appear here as soon as you RSVP to events or connect with clubs."
                      : "Sign in to see your personal campus activity feed."}
                  </div>
                )}
              </div>
            </section>

            <section className="ui-surface overflow-hidden">
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
                    <article key={event.id} className="rounded-2xl border border-[var(--line-soft)] bg-white p-5 shadow-[var(--shadow-soft)]">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                        <div className="flex items-start gap-4 lg:min-w-0 lg:flex-1">
                          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-[#51237f]">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                              {formatEventDate(event).split(" ")[1] ?? "Event"}
                            </span>
                            <span className="text-2xl font-semibold leading-none">
                              {formatEventDate(event).match(/\b\d{1,2}\b/)?.[0] ?? "?"}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 ring-1 ring-emerald-100">
                                Upcoming
                              </span>
                              <span className="text-sm font-medium text-gray-500">{event.clubName || "Campus office"}</span>
                            </div>

                            <h3 className="mt-3 text-xl font-semibold tracking-tight text-gray-950">
                              {event.name}
                            </h3>

                            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                              <div className="flex items-center gap-2">
                                <Clock size={15} className="text-gray-400" />
                                <span>{formatEventDate(event)} • {event.time || "Time to be announced"}</span>
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
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                          >
                            View event
                            <ArrowRight size={15} />
                          </Link>
                          <div className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600">
                            <Ticket size={15} className="text-[#51237f]" />
                            {event.registrationsCount} attending
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-gray-600">
                    {hasSession
                      ? "No upcoming events are listed yet. Browse events to add one to your week."
                      : "Log in to load your event reminders."}
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="ui-surface p-6">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">
                Discussions and groups
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Communities to reopen
              </h2>
              <div className="mt-5 space-y-3">
                {suggestedClubs.slice(0, 4).map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubs/${club.slug}`}
                    className="flex items-center justify-between rounded-xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#51237f]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    {club.name}
                    <span className="text-xs font-medium text-gray-500">{club.memberCount} members</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="ui-surface p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-purple-50 p-3 text-[#51237f]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">Keep it moving</div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-950">Useful next actions</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
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
