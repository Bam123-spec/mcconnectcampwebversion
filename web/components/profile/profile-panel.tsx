"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import type { PublicClub } from "@/lib/clubs";
import type { EventDetail } from "@/lib/events";
import type { WebSessionProfile } from "@/lib/auth-session";
import type { ActivityMembership } from "@/lib/activity";

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

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CC";

function ProfileStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="border-l border-[var(--line-soft)] pl-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        <Icon size={14} className="text-[var(--primary)]" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{value}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-[var(--line-soft)] py-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="max-w-[65%] text-right text-sm font-semibold text-gray-950">{value}</dd>
    </div>
  );
}

function EmptyState({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-8">
      <h3 className="text-base font-semibold text-gray-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
      >
        {label}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function MembershipCard({ membership }: { membership: ActivityMembership }) {
  const isPending = membership.role === "Request pending";

  return (
    <Link
      href={`/clubs/${membership.slug}`}
      className="group flex items-start gap-4 rounded-xl border border-[var(--line-soft)] bg-white p-4 transition hover:border-[rgba(71,10,104,0.24)] hover:shadow-[0_12px_26px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-sm font-semibold text-[var(--primary)]">
        {membership.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-gray-950 transition group-hover:text-[var(--primary)]">
          {membership.name}
        </span>
        <span className="mt-1 block text-sm text-gray-500">{membership.joinedLabel}</span>
      </span>
      <span
        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
          isPending
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        {membership.role}
      </span>
    </Link>
  );
}

function EventRow({ event }: { event: EventDetail }) {
  const date = formatEventDate(event);

  return (
    <article className="rounded-xl border border-[var(--line-soft)] bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[var(--surface-muted)] text-[var(--primary)]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
            {date.split(" ")[0] || "Date"}
          </span>
          <span className="text-xl font-semibold leading-none">{date.match(/\b\d{1,2}\b/)?.[0] || "--"}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--line-soft)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              Upcoming
            </span>
            <span className="text-sm text-gray-500">{event.clubName || "Campus hosted"}</span>
          </div>
          <h3 className="mt-3 text-base font-semibold leading-snug text-gray-950">{event.name}</h3>
          <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-gray-400" />
              <span>{event.time || "Time to be announced"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-gray-400" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/events/${event.id}`}
          className="hidden shrink-0 items-center gap-2 rounded-lg border border-[var(--line-soft)] bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition hover:border-[rgba(71,10,104,0.24)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 sm:inline-flex"
        >
          View
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

function SuggestedClubCard({ club }: { club: PublicClub }) {
  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="group block rounded-xl border border-[var(--line-soft)] bg-white p-4 transition hover:border-[rgba(71,10,104,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
            {club.category}
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-gray-950 transition group-hover:text-[var(--primary)]">
            {club.name}
          </h3>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-xs font-semibold text-[var(--primary)]">
          {club.initials}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs font-medium text-gray-500">
        <span>{club.campus}</span>
        <span>{club.memberCount} members</span>
      </div>
    </Link>
  );
}

export function ProfilePanel({
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
  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Guest profile";
  const email = profile?.email || "Not signed in";
  const role = profile?.role || (hasSession ? "Campus account" : "Guest");
  const initials = getInitials(displayName);
  const approvedMemberships = memberships.filter((membership) => membership.role !== "Request pending");
  const pendingMemberships = memberships.filter((membership) => membership.role === "Request pending");
  const nextEvent = upcomingEvents[0];
  const completionItems = [
    Boolean(profile?.full_name),
    Boolean(profile?.email),
    memberships.length > 0,
    upcomingEvents.length > 0,
  ];
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--page-background)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="border-b border-[var(--line-soft)] pb-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-3xl font-semibold text-white shadow-[var(--shadow-soft)]">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <ShieldCheck size={14} className="text-[var(--primary)]" />
                    {hasSession ? "Signed in" : "Guest view"}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[var(--line-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">
                    {role}
                  </span>
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                  {displayName}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <Mail size={15} className="text-gray-400" />
                    {email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Compass size={15} className="text-gray-400" />
                    Montgomery College
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {!hasSession ? (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  <UserRound size={16} />
                  Sign in
                </Link>
              ) : null}
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line-soft)] bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-[rgba(71,10,104,0.24)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                <Users size={16} />
                Clubs
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line-soft)] bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-[rgba(71,10,104,0.24)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                <CalendarDays size={16} />
                Events
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileStat label="clubs" value={approvedMemberships.length} icon={Users} />
            <ProfileStat label="pending" value={pendingMemberships.length} icon={UserPlus} />
            <ProfileStat label="events" value={upcomingEvents.length} icon={CalendarDays} />
            <ProfileStat label="profile" value={`${completion}%`} icon={Sparkles} />
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-8">
            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                    Profile
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Account details</h2>
                </div>
              </div>
              <dl className="mt-5 rounded-xl border border-[var(--line-soft)] bg-white px-5 shadow-sm">
                <DetailRow label="Display name" value={displayName} />
                <DetailRow label="Email" value={email} />
                <DetailRow label="Access role" value={role} />
                <DetailRow label="Organization" value={profile?.org_id || "Montgomery College"} />
              </dl>
            </section>

            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                    Memberships
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Your clubs</h2>
                </div>
                <Link
                  href="/clubs"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  Browse clubs
                  <ArrowRight size={15} />
                </Link>
              </div>
              <div className="mt-5 grid gap-3">
                {memberships.length > 0 ? (
                  memberships.map((membership) => <MembershipCard key={membership.id} membership={membership} />)
                ) : (
                  <EmptyState
                    title={hasSession ? "No clubs yet" : "Sign in to show your clubs"}
                    body={
                      hasSession
                        ? "Joined and pending clubs will appear here."
                        : "Your approved memberships and pending requests will appear here after sign-in."
                    }
                    href={hasSession ? "/clubs" : "/login"}
                    label={hasSession ? "Find clubs" : "Sign in"}
                  />
                )}
              </div>
            </section>

            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                    Schedule
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Upcoming events</h2>
                </div>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  View calendar
                  <ArrowRight size={15} />
                </Link>
              </div>
              <div className="mt-5 grid gap-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 5).map((event) => <EventRow key={event.id} event={event} />)
                ) : (
                  <EmptyState
                    title={hasSession ? "No upcoming events" : "Sign in to show your RSVPs"}
                    body={
                      hasSession
                        ? "Events you RSVP to will show here."
                        : "Your registered events will appear here after sign-in."
                    }
                    href={hasSession ? "/events" : "/login"}
                    label={hasSession ? "Browse events" : "Sign in"}
                  />
                )}
              </div>
            </section>
          </main>

          <aside className="space-y-6">
            <section className="rounded-xl border border-[var(--line-soft)] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Status</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">Profile snapshot</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-600">Next event</span>
                  <span className="max-w-[56%] truncate text-right text-sm font-semibold text-gray-950">
                    {nextEvent?.name || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-600">Club status</span>
                  <span className="text-sm font-semibold text-gray-950">
                    {memberships.length ? `${memberships.length} connected` : "Not connected"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-600">Campus account</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-950">
                    <CheckCircle2 size={15} className={hasSession ? "text-emerald-600" : "text-gray-300"} />
                    {hasSession ? "Active" : "Guest"}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[var(--line-soft)] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Shortcuts</p>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/clubs"
                  className="flex items-center justify-between rounded-lg border border-[var(--line-soft)] px-3 py-3 text-sm font-semibold text-gray-800 transition hover:text-[var(--primary)]"
                >
                  Find a club
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/events"
                  className="flex items-center justify-between rounded-lg border border-[var(--line-soft)] px-3 py-3 text-sm font-semibold text-gray-800 transition hover:text-[var(--primary)]"
                >
                  Browse events
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center justify-between rounded-lg border border-[var(--line-soft)] px-3 py-3 text-sm font-semibold text-gray-800 transition hover:text-[var(--primary)]"
                >
                  Support
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            <section>
              <div className="border-t border-[var(--line-soft)] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                  Suggested
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">Communities</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {suggestedClubs.slice(0, 4).map((club) => (
                  <SuggestedClubCard key={club.id} club={club} />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
