"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Users,
  Award,
  Ticket,
  ChevronRight,
  Compass,
} from "lucide-react";
import type { PublicClub } from "@/lib/clubs";
import type { EventDetail } from "@/lib/events";
import type { WebSessionProfile } from "@/lib/auth-session";
import type { ActivityMembership } from "@/lib/activity";

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
        <Link href={linkHref} className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#51237f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">
          {linkLabel}
          <ExternalLink size={15} />
        </Link>
      ) : null}
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-[#51237f]" />
      <span className="font-semibold text-gray-950">{value}</span>
      <span>{label}</span>
    </div>
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
  const upcomingCount = upcomingEvents.length;
  const leadershipCount = memberships.filter((membership) => membership.badgeTone === "officer").length;
  const nextEvent = upcomingEvents[0];
  const primaryMembership = memberships[0];
  const hasSession = Boolean(profile);

  return (
    <div className="min-h-screen bg-[#fbfbf9]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="pb-8">
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-600 shadow-sm">
            <ShieldCheck size={14} className="text-[#51237f]" />
            Campus activity
          </div>

          <div className="mt-5 max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              Activity
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              {hasSession
                ? "Keep track of the events you have coming up, the groups you belong to, and the things you may want to open next."
                : "Log in to see your RSVPs, memberships, and campus roles."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <SummaryChip label={hasSession ? "registered events" : "upcoming events"} value={upcomingCount} />
            <SummaryChip label="memberships" value={memberships.length} />
            <SummaryChip label="leadership roles" value={leadershipCount} />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
          <div className="space-y-8">
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                eyebrow={hasSession ? "Registered events" : "Sign in required"}
                title={hasSession ? "What is on your calendar" : "Your calendar is private"}
                description={hasSession ? "Open any event to review details, dates, and location." : "Use your account to load the events you have joined."}
                linkHref="/events"
                linkLabel="Browse events"
              />

              <div className="p-4 sm:p-6">
                {!hasSession ? (
                  <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-5">
                    <h3 className="text-lg font-semibold text-gray-950">Log in to view your activity</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      RSVPs and memberships are tied to your Supabase account.
                    </p>
                    <Link
                      href="/login"
                      className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#51237f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#43206a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                    >
                      Log in
                    </Link>
                  </div>
                ) : null}

                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#51237f]/20 hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                        <div className="flex items-start gap-4 lg:min-w-0 lg:flex-1">
                          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-[#51237f]">
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
                  )) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-gray-600">
                      {hasSession ? "No upcoming events are listed yet. Browse events to add one to your calendar." : "Log in to load your registered events."}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                eyebrow="Memberships"
                title={hasSession ? "Groups you are part of" : "Your groups"}
                description={hasSession ? "Your current campus groups, with the roles that matter most." : "Memberships will appear here after you log in."}
                linkHref="/clubs"
                linkLabel="Explore clubs"
              />

              <div className="divide-y divide-gray-100">
                {memberships.length > 0 ? memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#51237f] text-base font-semibold text-white shadow-sm">
                        {membership.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-950">{membership.name}</h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                              membership.badgeTone === "officer"
                                ? "bg-purple-50 text-[#51237f] ring-1 ring-purple-100"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {membership.badgeTone === "officer" ? "Officer" : "Member"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{membership.joinedLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                        {membership.role}
                      </span>
                      <Link
                        href={`/clubs/${membership.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-[#51237f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                      >
                        Open
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-8 text-sm leading-6 text-gray-600">
                    {hasSession
                      ? "No memberships are connected to this account yet. Browse clubs to find groups to join."
                      : "Log in to load your club memberships."}
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">Quick links</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Where to go next</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    The main pages students use most often from this area.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[#51237f]">
                  <Compass size={18} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Link
                  href="/events"
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-[#51237f]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Browse events
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
                <Link
                  href="/clubs"
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-[#51237f]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Explore clubs
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-[#51237f]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                >
                  Support & help
                  <ArrowRight size={16} className="text-gray-400" />
                </Link>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-[#faf7ff] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">At a glance</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Activity snapshot</h2>
                </div>
                <div className="rounded-lg bg-white p-3 text-[#51237f] shadow-sm">
                  <Users size={18} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-lg border border-white/80 bg-white p-4">
                  <div className="text-sm text-gray-500">Upcoming events</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-950">{upcomingCount}</div>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {nextEvent?.name ?? (hasSession ? "No registered events yet." : "Log in to load your RSVPs.")}
                  </p>
                </div>

                <div className="rounded-lg border border-white/80 bg-white p-4">
                  <div className="text-sm text-gray-500">Primary membership</div>
                  <div className="mt-2 text-xl font-semibold text-gray-950">
                    {primaryMembership?.name ?? "No memberships yet"}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {primaryMembership?.role ?? (hasSession ? "Join a group to see it here." : "Log in to see memberships.")}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">Suggested clubs</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Explore groups</h2>
              <div className="mt-5 space-y-3">
                {suggestedClubs.slice(0, 4).map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubs/${club.slug}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-[#51237f]/20 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    {club.name}
                    <span className="text-xs font-medium text-gray-500">{club.memberCount} members</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-50 p-3 text-[#51237f]">
                  <Award size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]/75">Need help</div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-950">Support and account access</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Use the help page if you need event guidance, membership questions, or account support.
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
