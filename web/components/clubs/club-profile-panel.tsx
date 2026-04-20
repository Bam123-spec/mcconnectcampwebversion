"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
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
    <main className="min-h-screen bg-[#f6f6f4]">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#51237f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to clubs
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="relative h-56 w-full bg-gray-100 md:h-72">
            <Image
              src={initialClub.coverImageUrl || fallbackCover}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl text-white">
                <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                  {initialClub.category}
                </div>
                <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
                  {initialClub.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 md:text-base">
                  {initialClub.campus}
                </p>
              </div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-[#51237f] text-2xl font-semibold text-white shadow-md">
                {initialClub.initials}
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[minmax(0,1.6fr)_380px]">
            <div className="space-y-8">
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#51237f]" />
                  <h2 className="text-xl font-semibold text-gray-950">About</h2>
                </div>
                <p className="max-w-3xl text-base leading-8 text-gray-600">
                  {initialClub.description || "This club has not added a public description yet."}
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold text-gray-950">Upcoming club events</h2>
                <div className="space-y-3">
                  {initialEvents.length > 0 ? (
                    initialEvents.map((event) => (
                      <Link
                        href={`/events/${event.id}`}
                        key={event.id}
                        className="block rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-[#51237f]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-gray-950">{event.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatEventDate(event.date, event.day)} at {event.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <MapPin className="h-4 w-4 text-[#51237f]" />
                            {event.location}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-9 text-center">
                      <p className="text-sm font-medium text-gray-700">
                        No upcoming events are listed for this club yet.
                      </p>
                      <Link
                        href="/events"
                        className="mt-3 inline-flex rounded-md text-sm font-semibold text-[#51237f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                      >
                        Browse all campus events
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-950">Get involved</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Join to add this club to your activity page and keep track of its events.
                </p>
                <div className="mt-4">
                  <ClubMembershipAction clubId={initialClub.id} viewerState={viewerState} />
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-950">Meeting details</h2>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#51237f]" />
                    <div>
                      <div className="font-semibold text-gray-950">{initialClub.location}</div>
                      <div className="text-gray-500">{initialClub.campus}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#51237f]" />
                    <div>
                      <div className="font-semibold text-gray-950">{initialClub.meetingTime}</div>
                      <div className="text-gray-500">{initialClub.meetingDay}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#51237f]" />
                    <div>
                      <div className="font-semibold text-gray-950">{initialClub.memberCount} members</div>
                      <div className="text-gray-500">Reported by the club directory</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-950">Officer and contact info</h2>
                {initialOfficers.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {initialOfficers.map((officer) => (
                      <div key={officer.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#51237f]">
                            <UserRound className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-950">{officer.name}</div>
                            <div className="text-sm text-gray-500">{formatOfficerRole(officer.role)}</div>
                            {officer.email ? (
                              <a
                                href={`mailto:${officer.email}`}
                                className="mt-1 inline-flex items-center gap-1 rounded-md text-sm font-medium text-[#51237f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                {officer.email}
                              </a>
                            ) : null}
                          </div>
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
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-[#51237f] hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email club
                  </a>
                ) : null}
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
