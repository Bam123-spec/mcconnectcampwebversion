"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, Bookmark, Clock, Clock3, LoaderCircle, QrCode, ShieldCheck, Ticket, Users, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatEventDateLabel, formatJoinedLabel, formatOfficerRole, getClubInitials } from "@/lib/live-data";
import { slugifyClubName } from "@/lib/club-utils";

type ActivityRegistration = {
  id: string;
  eventName: string;
  clubName: string;
  dateLabel: string;
  location: string;
  status: "Confirmed";
  isUpcoming: boolean;
};

type ActivityMembership = {
  id: string;
  name: string;
  role: string;
  joinedLabel: string;
  initials: string;
  badgeTone: "officer" | "member";
};

type SavedEvent = {
  id: string;
  name: string;
  dateLabel: string;
  location: string;
};

type RegistrationRow = {
  id: string;
  created_at?: string | null;
  event:
    | {
        name: string;
        location?: string | null;
        date?: string | null;
        day?: string | null;
        time?: string | null;
        clubs?:
          | {
              name?: string | null;
            }
          | {
              name?: string | null;
            }[]
          | null;
      }
    | {
        name: string;
        location?: string | null;
        date?: string | null;
        day?: string | null;
        time?: string | null;
        clubs?:
          | {
              name?: string | null;
            }
          | {
              name?: string | null;
            }[]
          | null;
      }[]
    | null;
};

type MembershipRow = {
  id: string;
  club_id: string;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export function ActivityPanel() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [registrations, setRegistrations] = useState<ActivityRegistration[]>([]);
  const [memberships, setMemberships] = useState<ActivityMembership[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadActivity = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setRegistrations([]);
          setMemberships([]);
          setSavedEvents([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setSignedIn(true);
      }

      const [registrationsResult, membershipsResult, officersResult, savedEventsResult] = await Promise.all([
        supabase
          .from("event_registrations")
          .select("id, created_at, event:events(name, location, date, day, time, clubs(name))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("club_members")
          .select("id, club_id, clubs(name)")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .limit(8),
        supabase
          .from("officers")
          .select("club_id, role")
          .eq("user_id", user.id),
        supabase
          .from("event_saved")
          .select("id, event:events(name, location, date, day, time)")
          .eq("user_id", user.id)
          .limit(6),
      ]);

      if (registrationsResult.error || membershipsResult.error || officersResult.error || savedEventsResult.error) {
        if (!cancelled) {
          setError(
            registrationsResult.error?.message ||
              membershipsResult.error?.message ||
              officersResult.error?.message ||
              savedEventsResult.error?.message ||
              "Unable to load your activity right now."
          );
          setLoading(false);
        }
        return;
      }

      const officerMap = new Map<string, string>();
      for (const officerRow of officersResult.data ?? []) {
        if (officerRow.club_id) {
          officerMap.set(officerRow.club_id, officerRow.role ?? "Officer");
        }
      }

      const nextRegistrations: ActivityRegistration[] = ((registrationsResult.data ?? []) as RegistrationRow[])
        .map((registration) => {
          const event = firstItem(registration.event);
          if (!event?.name) return null;
          const eventClub = firstItem(event.clubs);

          const eventDate = event.date || event.day || null;
          const parsedDate = eventDate ? new Date(eventDate) : null;

          return {
            id: registration.id,
            eventName: event.name,
            clubName: eventClub?.name || "Campus Event",
            dateLabel: formatEventDateLabel(eventDate, event.time),
            location: event.location || "Location TBA",
            status: "Confirmed",
            isUpcoming: parsedDate ? parsedDate >= new Date() : true,
          };
        })
        .filter(Boolean) as ActivityRegistration[];

      const nextMemberships: ActivityMembership[] = ((membershipsResult.data ?? []) as MembershipRow[])
        .map((membership) => {
          const club = firstItem(membership.clubs);
          const clubName = club?.name;
          if (!clubName) return null;

          const officerRole = officerMap.get(membership.club_id);

          return {
            id: membership.id,
            name: clubName,
            role: officerRole ? `${formatOfficerRole(officerRole)} (Officer)` : "Member",
            joinedLabel: formatJoinedLabel(),
            initials: getClubInitials(clubName),
            badgeTone: officerRole ? "officer" : "member",
          };
        })
        .filter(Boolean) as ActivityMembership[];

      const nextSavedEvents: SavedEvent[] = ((savedEventsResult.data ?? []) as Array<{
        id: string;
        event:
          | {
              name?: string | null;
              location?: string | null;
              date?: string | null;
              day?: string | null;
              time?: string | null;
            }
          | {
              name?: string | null;
              location?: string | null;
              date?: string | null;
              day?: string | null;
              time?: string | null;
            }[]
          | null;
      }>)
        .map((saved) => {
          const event = firstItem(saved.event);
          if (!event?.name) return null;
          return {
            id: saved.id,
            name: event.name,
            dateLabel: formatEventDateLabel(event.date || event.day || null, event.time),
            location: event.location || "Location TBA",
          };
        })
        .filter(Boolean) as SavedEvent[];

      if (!cancelled) {
        setRegistrations(nextRegistrations);
        setMemberships(nextMemberships);
        setSavedEvents(nextSavedEvents);
        setLoading(false);
      }
    };

    loadActivity();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadActivity();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const leadershipCount = memberships.filter((membership) => membership.badgeTone === "officer").length;

  if (loading) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <LoaderCircle className="animate-spin text-[#51237f] mb-4" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Loading your activity</h1>
          <p className="text-gray-500 mt-2">Pulling your Montgomery College memberships and event registrations.</p>
        </div>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sign in to view your activity</h1>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              Your Montgomery College memberships, RSVPs, and officer access will appear here once you sign in.
            </p>
            <Link
              href="/login"
              className="inline-flex mt-6 items-center rounded-md bg-[#51237f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#45206b] transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Activity</h1>
          <p className="text-gray-600 mt-2">Preview your memberships, event registrations, and campus involvement in one place.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Ticket size={20} className="text-[#51237f]" />
                  Upcoming RSVPs
                </h2>
                <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
                  Browse Events
                </Link>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {registrations.length ? registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-green-100 text-green-800">
                          {registration.status}
                        </span>
                        <span className="text-xs font-medium text-gray-500">{registration.clubName}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{registration.eventName}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-gray-400" />
                          {registration.dateLabel}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-gray-400" />
                          {registration.location}
                        </div>
                      </div>
                    </div>

                    <div className="sm:border-l sm:border-gray-200 sm:pl-6 flex flex-row sm:flex-col items-center justify-center gap-3 shrink-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                        {registration.isUpcoming ? <QrCode size={32} /> : <Clock3 size={32} />}
                      </div>
                      <span className="text-sm font-semibold text-[#51237f]">
                        {registration.isUpcoming ? "Event Pass" : "Past Event"}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                    <h3 className="text-lg font-bold text-gray-900">No event registrations yet</h3>
                    <p className="text-sm text-gray-500 mt-2">Once you RSVP to events, they’ll appear here.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Bookmark size={20} className="text-[#51237f]" />
                  Saved Events
                </h2>
                <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
                  Explore Events
                </Link>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {savedEvents.length ? (
                  savedEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border border-gray-200 px-4 py-4">
                      <div className="font-bold text-gray-900">{event.name}</div>
                      <div className="mt-2 text-sm text-gray-500">{event.dateLabel}</div>
                      <div className="mt-1 text-sm text-gray-500">{event.location}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                    <h3 className="text-lg font-bold text-gray-900">No saved events yet</h3>
                    <p className="text-sm text-gray-500 mt-2">Save events from the campus feed to come back to them later.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award size={20} className="text-[#51237f]" />
                  My Memberships
                </h2>
                <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
                  Find Groups
                </Link>
              </div>
              <ul className="divide-y divide-gray-100">
                {memberships.length ? memberships.map((membership) => (
                  <li key={membership.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-md bg-[#51237f] flex items-center justify-center text-white font-black text-lg shadow-sm border border-white shrink-0">
                      {membership.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/clubs/${slugifyClubName(membership.name)}`}
                        className="text-base font-bold text-gray-900 truncate hover:text-[#51237f]"
                      >
                        {membership.name}
                      </Link>
                      <div className="text-sm text-gray-500 mt-0.5">{membership.joinedLabel}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                          membership.badgeTone === "officer"
                            ? "bg-purple-100 text-[#51237f]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {membership.role}
                      </span>
                    </div>
                  </li>
                )) : (
                  <li className="p-6">
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                      <h3 className="text-lg font-bold text-gray-900">No club memberships yet</h3>
                      <p className="text-sm text-gray-500 mt-2">Join a club to start building your campus activity profile.</p>
                    </div>
                  </li>
                )}
              </ul>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-[#51237f] text-white rounded-xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10" />
              <h2 className="font-bold text-lg mb-6">Involvement Snapshot</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/20 pb-4">
                  <div className="text-purple-200 text-sm font-medium">Registered Events</div>
                  <div className="text-3xl font-black">{registrations.length}</div>
                </div>
                <div className="flex justify-between items-end border-b border-white/20 pb-4">
                  <div className="text-purple-200 text-sm font-medium">Groups Joined</div>
                  <div className="text-3xl font-black">{memberships.length}</div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-purple-200 text-sm font-medium">Leadership Roles</div>
                  <div className="text-3xl font-black">{leadershipCount}</div>
                </div>
              </div>

              <Link
                href="/events"
                className="block w-full mt-6 bg-white text-[#51237f] text-center font-bold py-2.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Explore More Events
              </Link>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Preview Notes</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <Users className="text-[#51237f] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Live involvement data</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      This page is now reading your approved club memberships and event registrations from Supabase.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-[#51237f] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Officer roles included</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      If you have officer status in a club, it will be reflected here automatically.
                    </p>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {error}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
