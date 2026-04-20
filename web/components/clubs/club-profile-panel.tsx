"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";

type ClubProfile = {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  memberCount: number;
  meetingTime: string;
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

const formatEventDate = (value: string) => {
  if (!value) return "Date to be announced";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function ClubProfilePanel({
  initialClub,
  initialEvents,
}: {
  initialClub: ClubProfile;
  initialEvents: ClubEvent[];
}) {
  const clubBadge = initialClub.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
            Back to clubs
          </Link>
          <span className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-500">
            Club profile
          </span>
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="relative h-56 w-full bg-gray-100">
            <Image
              src={initialClub.coverImageUrl || fallbackCover}
              alt={initialClub.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          </div>

          <div className="px-6 pb-8 pt-0">
            <div className="relative -mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-white bg-[#51237f] text-2xl font-black text-white shadow-md">
                  {clubBadge}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Club Profile</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900">{initialClub.name}</h1>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Members</div>
                  <div className="mt-1 flex items-center gap-2 font-bold text-gray-900">
                    <Users size={16} className="text-[#51237f]" />
                    {initialClub.memberCount}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Meeting Time</div>
                  <div className="mt-1 flex items-center gap-2 font-bold text-gray-900">
                    <CalendarDays size={16} className="text-[#51237f]" />
                    {initialClub.meetingTime || "TBA"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
              <div className="space-y-8">
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#51237f]" />
                    <h2 className="text-lg font-bold text-gray-900">About this club</h2>
                  </div>
                  <p className="max-w-3xl leading-7 text-gray-600">
                    {initialClub.description || "This club has not added a public description yet."}
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Upcoming club events</h2>
                  <div className="space-y-3">
                    {initialEvents.length > 0 ? (
                      initialEvents.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h3 className="text-base font-bold text-gray-900">{event.name}</h3>
                              <p className="mt-1 text-sm text-gray-500">{event.date ? formatEventDate(event.date) : event.day || "Date to be announced"} • {event.time}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                              <MapPin size={15} className="text-[#51237f]" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-gray-600">
                        No upcoming club events are listed yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
                  <div className="mt-4 space-y-3">
                    <Link
                      href="/events"
                      className="block rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-[#51237f] hover:text-[#51237f] transition-colors"
                    >
                      Browse campus events
                    </Link>
                    <Link
                      href="/activity"
                      className="block rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-[#51237f] hover:text-[#51237f] transition-colors"
                    >
                      View activity
                    </Link>
                  </div>
                </section>

                <section className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                  <h2 className="text-base font-bold text-[#51237f]">Club contact</h2>
                  <p className="mt-2 text-sm leading-6 text-[#51237f]/80">
                    Use campus events and club listings to find meeting details, event updates, and ways to get involved.
                  </p>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
