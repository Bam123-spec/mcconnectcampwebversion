"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ClubMembershipAction } from "@/components/clubs/club-membership-action";
import type { ClubOfficer, ClubViewerState } from "@/lib/clubs";

type ClubProfile = {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  memberCount: number;
  location: string;
  campus: string;
  meetingDay: string;
  meetingTime: string;
  email: string | null;
  category: string;
  initials: string;
  slug: string;
};

type ClubEvent = {
  id: string;
  name: string;
  date: string;
  day?: string | null;
  time: string;
  location: string;
};

const fallbackCover =
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600&auto=format&fit=crop";

const formatEventDate = (value: string, fallback?: string | null) => {
  if (!value) return fallback || "Date to be announced";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatOfficerRole = (role: string) =>
  role
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

export function ClubProfilePanel({
  initialClub,
  initialEvents,
  initialOfficers,
  viewerState,
}: {
  initialClub: ClubProfile;
  initialEvents: ClubEvent[];
  initialOfficers: ClubOfficer[];
  viewerState: ClubViewerState;
}) {
  return (
    <main className="min-h-screen bg-[var(--page-background)]">
      <div className="border-b border-[var(--line-soft)] bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to clubs
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.75fr)] lg:items-start">
          <div className="space-y-8">
            <div className="relative h-[320px] overflow-hidden rounded-[24px] bg-gray-100 sm:h-[380px]">
              <Image
                src={initialClub.coverImageUrl || fallbackCover}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                  {initialClub.category}
                </div>
                <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {initialClub.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
                  <span>{initialClub.campus}</span>
                  <span className="h-1 w-1 rounded-full bg-white/70" />
                  <span>{initialClub.memberCount} members</span>
                </div>
              </div>
            </div>

            <section>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                <ShieldCheck className="h-4 w-4" />
                About
              </div>
              <p className="max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
                {initialClub.description || "This club has not added a public description yet."}
              </p>
            </section>

            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                    Upcoming
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-gray-950">Club events</h2>
                </div>
                <Link
                  href="/events"
                  className="text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  Browse all events
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
                {initialEvents.length > 0 ? (
                  initialEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group flex flex-col gap-2 py-4 transition hover:bg-[rgba(255,255,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-950 transition-colors group-hover:text-[var(--primary)]">
                          {event.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatEventDate(event.date, event.day)} at {event.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 sm:justify-end">
                        <MapPin className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-sm leading-7 text-gray-600">
                    No upcoming events are listed for this club yet.{" "}
                    <Link
                      href="/events"
                      className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                    >
                      Browse all campus events
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-10 pt-1 lg:sticky lg:top-6">
            <section>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                Get involved
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Join to add this club to your activity page and keep track of its events.
              </p>
              <div className="mt-4">
                <ClubMembershipAction clubId={initialClub.id} viewerState={viewerState} />
              </div>
            </section>

            <section>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                Meeting details
              </div>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="mt-1 font-semibold text-gray-950">{initialClub.location}</dd>
                  <dd className="mt-1 text-gray-600">{initialClub.campus}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Time</dt>
                  <dd className="mt-1 font-semibold text-gray-950">{initialClub.meetingTime}</dd>
                  <dd className="mt-1 text-gray-600">{initialClub.meetingDay}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Size</dt>
                  <dd className="mt-1 font-semibold text-gray-950">{initialClub.memberCount} members</dd>
                  <dd className="mt-1 text-gray-600">Reported by the club directory</dd>
                </div>
              </dl>
            </section>

            <section>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                Officer and contact info
              </div>
              {initialOfficers.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {initialOfficers.map((officer) => (
                    <div key={officer.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white text-[var(--primary)]">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-950">{officer.name}</div>
                        <div className="text-sm text-gray-500">{formatOfficerRole(officer.role)}</div>
                        {officer.email ? (
                          <a
                            href={`mailto:${officer.email}`}
                            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {officer.email}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Officer details are not public for this club yet.
                </p>
              )}

              {initialClub.email ? (
                <a
                  href={`mailto:${initialClub.email}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  <Mail className="h-4 w-4" />
                  Email club
                </a>
              ) : null}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
