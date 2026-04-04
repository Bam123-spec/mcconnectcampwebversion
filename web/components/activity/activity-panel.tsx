"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Award, Clock, Clock3, QrCode, ShieldCheck, Ticket, Users, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AUTH_ENABLED } from "@/lib/features";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  date: string | null;
  day: string | null;
  time: string | null;
  cover_image_url: string | null;
  club_id: string | null;
};

type RegistrationRow = {
  id: string;
  created_at: string | null;
  event_id: string;
  event: EventRow | EventRow[] | null;
};

type ClubRow = {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  member_count: number | null;
};

type MembershipRow = {
  id: string;
  created_at: string | null;
  club_id: string;
  status: string | null;
  clubs: ClubRow | ClubRow[] | null;
};

type OfficerRow = {
  club_id: string;
  role: string | null;
};

type ActivityRegistration = {
  id: string;
  eventId: string;
  eventName: string;
  clubName: string;
  dateLabel: string;
  location: string;
  status: "Confirmed";
  isUpcoming: boolean;
};

type ActivityMembership = {
  id: string;
  clubId: string;
  name: string;
  role: string;
  joinedLabel: string;
  initials: string;
  badgeTone: "officer" | "member";
};

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

const toDateValue = (value: string | null | undefined) => {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getUpcomingStatus = (date: Date | null) => {
  if (!date) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date >= now;
};

const formatEventLabel = (dateValue: string | null, fallbackDay: string | null, time: string | null) => {
  const parsedDate = toDateValue(dateValue || fallbackDay);
  const dateLabel = parsedDate
    ? fullDateFormatter.format(parsedDate)
    : (dateValue || fallbackDay || "Date to be announced");

  return time ? `${dateLabel} • ${time}` : dateLabel;
};

const formatMembershipLabel = (createdAt: string | null) => {
  const parsedDate = toDateValue(createdAt);
  return parsedDate ? `Joined ${monthYearFormatter.format(parsedDate)}` : "Joined recently";
};

const formatOfficerRole = (role: string | null | undefined) => {
  if (!role) return "Member";

  return role
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const unwrapSingle = <T,>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
};

export function ActivityPanel() {
  const [loading, setLoading] = useState(AUTH_ENABLED);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<ActivityRegistration[]>([]);
  const [memberships, setMemberships] = useState<ActivityMembership[]>([]);
  const [leadershipCount, setLeadershipCount] = useState(0);

  useEffect(() => {
    if (!AUTH_ENABLED) {
      return;
    }

    let mounted = true;

    const loadActivity = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError) {
        setError("We couldn't confirm your account right now.");
        setHasSession(false);
        setLoading(false);
        return;
      }

      if (!user) {
        setHasSession(false);
        setLoading(false);
        return;
      }

      setHasSession(true);

      const [registrationResult, membershipResult, officerResult] = await Promise.all([
        supabase
          .from("event_registrations")
          .select(`
            id,
            created_at,
            event_id,
            event:events (
              id,
              name,
              description,
              location,
              date,
              day,
              time,
              cover_image_url,
              club_id
            )
          `)
          .eq("user_id", user.id),
        supabase
          .from("club_members")
          .select(`
            id,
            created_at,
            club_id,
            status,
            clubs (
              id,
              name,
              description,
              cover_image_url,
              member_count
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "approved"),
        supabase
          .from("officers")
          .select("club_id, role")
          .eq("user_id", user.id),
      ]);

      if (!mounted) return;

      if (registrationResult.error || membershipResult.error || officerResult.error) {
        console.error("Error loading activity:", {
          registrations: registrationResult.error,
          memberships: membershipResult.error,
          officers: officerResult.error,
        });
        setError("We couldn't load your activity right now.");
        setLoading(false);
        return;
      }

      const eventClubIds = Array.from(
        new Set(
          (((registrationResult.data as RegistrationRow[] | null) || [])
            .map((registration) => unwrapSingle(registration.event)?.club_id)
            .filter(Boolean) as string[])
        )
      );

      const clubNameMap = new Map<string, string>();
      if (eventClubIds.length > 0) {
        const { data: eventClubs, error: eventClubsError } = await supabase
          .from("clubs")
          .select("id, name")
          .in("id", eventClubIds);

        if (eventClubsError) {
          console.error("Error loading event clubs:", eventClubsError);
        } else {
          (eventClubs || []).forEach((club) => {
            if (club?.id && club?.name) {
              clubNameMap.set(club.id, club.name);
            }
          });
        }
      }

      const officerMap = new Map<string, string>();
      (officerResult.data as OfficerRow[] | null)?.forEach((officer) => {
        if (officer.club_id) {
          officerMap.set(officer.club_id, formatOfficerRole(officer.role));
        }
      });

      const normalizedRegistrations = ((registrationResult.data as RegistrationRow[] | null) || [])
        .map((registration) => {
          const event = unwrapSingle(registration.event);
          if (!event?.id || !event.name) return null;

          const eventDate = event.date || event.day;

          return {
            id: registration.id,
            eventId: event.id,
            eventName: event.name,
            clubName: event.club_id ? (clubNameMap.get(event.club_id) || "Campus Event") : "Campus Event",
            dateLabel: formatEventLabel(event.date, event.day, event.time),
            location: event.location || "Campus location",
            status: "Confirmed" as const,
            isUpcoming: getUpcomingStatus(toDateValue(eventDate)),
          };
        })
        .filter(Boolean) as ActivityRegistration[];

      const normalizedMemberships = ((membershipResult.data as MembershipRow[] | null) || [])
        .map((membership) => {
          const club = unwrapSingle(membership.clubs);
          if (!club?.id || !club.name) return null;

          const officerRole = officerMap.get(club.id);
          const role = officerRole ? `${officerRole} (Officer)` : "Member";

          return {
            id: membership.id,
            clubId: club.id,
            name: club.name,
            role,
            joinedLabel: formatMembershipLabel(membership.created_at),
            initials: getInitials(club.name),
            badgeTone: officerRole ? "officer" : "member",
          };
        })
        .filter(Boolean) as ActivityMembership[];

      normalizedRegistrations.sort((left, right) => {
        if (left.isUpcoming !== right.isUpcoming) {
          return left.isUpcoming ? -1 : 1;
        }
        return left.eventName.localeCompare(right.eventName);
      });

      normalizedMemberships.sort((left, right) => left.name.localeCompare(right.name));

      setRegistrations(normalizedRegistrations);
      setMemberships(normalizedMemberships);
      setLeadershipCount(officerMap.size);
      setLoading(false);
    };

    loadActivity();

    return () => {
      mounted = false;
    };
  }, []);

  const snapshot = useMemo(
    () => ({
      registeredEvents: registrations.length,
      activeMemberships: memberships.length,
      leadershipRoles: leadershipCount,
    }),
    [leadershipCount, memberships.length, registrations.length]
  );

  if (loading) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-9 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-80 rounded bg-gray-100 animate-pulse mt-3" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-72 rounded-xl border border-gray-200 bg-white animate-pulse" />
              <div className="h-80 rounded-xl border border-gray-200 bg-white animate-pulse" />
            </div>
            <div className="space-y-8">
              <div className="h-64 rounded-xl bg-white border border-gray-200 animate-pulse" />
              <div className="h-40 rounded-xl bg-white border border-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="bg-[#f5f6f8] min-h-[calc(100vh-60px)] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {AUTH_ENABLED ? "Sign In Required" : "Activity is coming soon"}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {AUTH_ENABLED
              ? "You must be logged into Raptor Connect to view your personalized activity, memberships, and RSVPs."
              : "The web portal is currently in public preview mode. Personalized activity, memberships, and RSVPs will appear here once web sign-in is re-enabled."}
          </p>
          <Link
            href={AUTH_ENABLED ? "/login" : "/"}
            className="inline-block bg-[#51237f] hover:bg-[#51237f]/90 text-white px-8 py-3 rounded-md font-bold shadow-sm transition-colors"
          >
            {AUTH_ENABLED ? "Sign In with MyMC" : "Return to homepage"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Activity</h1>
          <p className="text-gray-600 mt-2">Manage your club memberships, event registrations, and leadership access.</p>
        </div>

        {error ? (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

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
                {registrations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                    <p className="text-base font-semibold text-gray-900">No event registrations yet</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Once you RSVP to events, your upcoming passes and registrations will appear here.
                    </p>
                  </div>
                ) : (
                  registrations.map((registration) => (
                    <div
                      key={registration.id}
                      className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-lg p-4 hover:border-[#51237f] transition-colors group"
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
                        <Link
                          href="/events"
                          className="text-sm font-semibold text-[#51237f] hover:underline"
                        >
                          {registration.isUpcoming ? "View Pass" : "View Event"}
                        </Link>
                      </div>
                    </div>
                  ))
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

              {memberships.length === 0 ? (
                <div className="p-6">
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                    <p className="text-base font-semibold text-gray-900">No club memberships yet</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Join a club to track your communities, leadership roles, and campus involvement here.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {memberships.map((membership) => (
                    <li
                      key={membership.id}
                      className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-md bg-[#51237f] flex items-center justify-center text-white font-black text-lg shadow-sm border border-white shrink-0">
                        {membership.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">{membership.name}</h3>
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
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-[#51237f] text-white rounded-xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10" />

              <h2 className="font-bold text-lg mb-6">Involvement Snapshot</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/20 pb-4">
                  <div className="text-purple-200 text-sm font-medium">Registered Events</div>
                  <div className="text-3xl font-black">{snapshot.registeredEvents}</div>
                </div>
                <div className="flex justify-between items-end border-b border-white/20 pb-4">
                  <div className="text-purple-200 text-sm font-medium">Groups Joined</div>
                  <div className="text-3xl font-black">{snapshot.activeMemberships}</div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-purple-200 text-sm font-medium">Leadership Roles</div>
                  <div className="text-3xl font-black">{snapshot.leadershipRoles}</div>
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
                <h2 className="font-bold text-gray-900">Pending Actions</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <Users className="text-[#51237f] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Discover new clubs</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Browse organizations and join more communities that match your campus interests.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-[#51237f] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Leadership access</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {leadershipCount > 0
                        ? `You currently hold ${leadershipCount} leadership ${leadershipCount === 1 ? "role" : "roles"}.`
                        : "Officer and admin access will appear here once you are assigned a leadership role."}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
