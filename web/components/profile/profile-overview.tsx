"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, CalendarDays, LoaderCircle, ShieldCheck, UserRound, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatEventDateLabel, formatOfficerRole, getClubInitials } from "@/lib/live-data";
import { getClubPath } from "@/lib/club-utils";

type ProfileRow = {
  full_name?: string | null;
  username?: string | null;
  major?: string | null;
  year?: string | null;
  role?: string | null;
  officer_title?: string | null;
  bio?: string | null;
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

type OfficerRow = {
  club_id: string;
  role?: string | null;
};

type RegistrationRow = {
  id: string;
  event?:
    | {
        id?: string | null;
        name?: string | null;
        location?: string | null;
        date?: string | null;
        day?: string | null;
        time?: string | null;
      }
    | {
        id?: string | null;
        name?: string | null;
        location?: string | null;
        date?: string | null;
        day?: string | null;
        time?: string | null;
      }[]
    | null;
};

type SavedRow = {
  id: string;
  event?:
    | {
        id?: string | null;
        name?: string | null;
        location?: string | null;
        date?: string | null;
        day?: string | null;
        time?: string | null;
      }
    | {
        id?: string | null;
        name?: string | null;
        location?: string | null;
        date?: string | null;
        day?: string | null;
        time?: string | null;
      }[]
    | null;
};

type ClubSummary = {
  id: string;
  clubId: string;
  name: string;
  initials: string;
  roleLabel: string;
  href: string;
  isLeadership: boolean;
};

type EventSummary = {
  id: string;
  eventId: string | null;
  name: string;
  detail: string;
  location: string;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const buildEventSummary = (id: string, value: RegistrationRow["event"] | SavedRow["event"]): EventSummary | null => {
  const event = firstItem(value);
  if (!event?.name) return null;

  return {
    id,
    eventId: event.id ?? null,
    name: event.name,
    detail: formatEventDateLabel(event.date || event.day || null, event.time),
    location: event.location || "Location TBA",
  };
};

export function ProfileOverview() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [memberships, setMemberships] = useState<ClubSummary[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<EventSummary[]>([]);
  const [savedEvents, setSavedEvents] = useState<EventSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setEmail(null);
          setProfile(null);
          setMemberships([]);
          setRegisteredEvents([]);
          setSavedEvents([]);
          setLoading(false);
        }
        return;
      }

      const [profileResult, membershipsResult, officersResult, registrationsResult, savedResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("club_members")
          .select("id, club_id, clubs(name)")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .order("id", { ascending: false })
          .limit(12),
        supabase.from("officers").select("club_id, role").eq("user_id", user.id),
        supabase
          .from("event_registrations")
          .select("id, event:events(id, name, location, date, day, time)")
          .eq("user_id", user.id)
          .order("id", { ascending: false })
          .limit(6),
        supabase
          .from("event_saved")
          .select("id, event:events(id, name, location, date, day, time)")
          .eq("user_id", user.id)
          .order("id", { ascending: false })
          .limit(6),
      ]);

      if (
        profileResult.error ||
        membershipsResult.error ||
        officersResult.error ||
        registrationsResult.error ||
        savedResult.error
      ) {
        if (!cancelled) {
          setError(
            profileResult.error?.message ||
              membershipsResult.error?.message ||
              officersResult.error?.message ||
              registrationsResult.error?.message ||
              savedResult.error?.message ||
              "Unable to load your profile right now."
          );
          setSignedIn(true);
          setEmail(user.email ?? null);
          setLoading(false);
        }
        return;
      }

      const officerMap = new Map<string, string>();
      for (const officer of (officersResult.data ?? []) as OfficerRow[]) {
        if (officer.club_id) {
          officerMap.set(officer.club_id, officer.role ?? "Officer");
        }
      }

      const nextMemberships = ((membershipsResult.data ?? []) as MembershipRow[])
        .map((membership) => {
          const club = firstItem(membership.clubs);
          if (!club?.name) return null;
          const officerRole = officerMap.get(membership.club_id);

          return {
            id: membership.id,
            clubId: membership.club_id,
            name: club.name,
            initials: getClubInitials(club.name),
            roleLabel: officerRole ? formatOfficerRole(officerRole) : "Member",
            href: getClubPath(membership.club_id),
            isLeadership: Boolean(officerRole),
          };
        })
        .filter(Boolean) as ClubSummary[];

      const nextRegisteredEvents = ((registrationsResult.data ?? []) as RegistrationRow[])
        .map((registration) => buildEventSummary(registration.id, registration.event))
        .filter(Boolean) as EventSummary[];

      const nextSavedEvents = ((savedResult.data ?? []) as SavedRow[])
        .map((saved) => buildEventSummary(saved.id, saved.event))
        .filter(Boolean) as EventSummary[];

      if (!cancelled) {
        setSignedIn(true);
        setEmail(user.email ?? null);
        setProfile((profileResult.data as ProfileRow | null) ?? null);
        setMemberships(nextMemberships);
        setRegisteredEvents(nextRegisteredEvents);
        setSavedEvents(nextSavedEvents);
        setLoading(false);
      }
    };

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <LoaderCircle className="animate-spin text-[#51237f] mb-4" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Loading your profile</h1>
          <p className="text-gray-500 mt-2">Pulling your campus account, memberships, and activity.</p>
        </div>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sign in to view your profile</h1>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              Your Montgomery College profile, memberships, and saved activity will appear here once you sign in.
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

  const displayName = profile?.full_name || email?.split("@")[0] || "Student";
  const subtitleParts = [profile?.major, profile?.year].filter(Boolean);

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-8">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#51237f] text-xl font-black text-white">
                    {displayName
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Profile</p>
                    <h1 className="mt-1 text-4xl font-black tracking-tight text-gray-900">{displayName}</h1>
                    <p className="mt-2 text-sm text-gray-500">
                      {subtitleParts.length ? subtitleParts.join(" · ") : "Montgomery College account"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile?.role === "admin" ? (
                    <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-semibold text-[#8a6116]">
                      Platform admin
                    </span>
                  ) : null}
                  {profile?.officer_title ? (
                    <span className="rounded-full bg-[#ede7f6] px-3 py-1 text-xs font-semibold text-[#51237f]">
                      {profile.officer_title}
                    </span>
                  ) : null}
                  {profile?.username ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      @{profile.username}
                    </span>
                  ) : null}
                </div>
              </div>

              {profile?.bio ? (
                <p className="mt-6 max-w-3xl text-sm leading-7 text-gray-600">{profile.bio}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                  <Users size={16} className="text-[#51237f]" />
                  Joined Clubs
                </div>
                <div className="mt-3 text-3xl font-black text-gray-900">{memberships.length}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                  <ShieldCheck size={16} className="text-[#51237f]" />
                  Leadership Roles
                </div>
                <div className="mt-3 text-3xl font-black text-gray-900">
                  {memberships.filter((membership) => membership.isLeadership).length}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                  <CalendarDays size={16} className="text-[#51237f]" />
                  Registered Events
                </div>
                <div className="mt-3 text-3xl font-black text-gray-900">{registeredEvents.length}</div>
              </div>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-bold text-gray-900">Club Memberships</h2>
                <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
                  Browse clubs
                </Link>
              </div>
              <div className="p-6 space-y-3">
                {memberships.length ? (
                  memberships.map((membership) => (
                    <Link
                      key={membership.id}
                      href={membership.href}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-4 transition hover:border-[#51237f] hover:bg-[#faf8fd]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#51237f] text-sm font-black text-white shrink-0">
                          {membership.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{membership.name}</p>
                          <p className="text-xs text-gray-500">{membership.roleLabel}</p>
                        </div>
                      </div>
                      {membership.isLeadership ? (
                        <span className="rounded-full bg-[#ede7f6] px-3 py-1 text-xs font-semibold text-[#51237f]">
                          Leadership
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          Member
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                    You haven&apos;t joined any clubs yet.
                  </div>
                )}
              </div>
            </section>
          </section>

          <aside className="space-y-8">
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-bold text-gray-900">Saved Events</h2>
                <Bookmark size={18} className="text-[#51237f]" />
              </div>
              <div className="p-6 space-y-4">
                {savedEvents.length ? (
                  savedEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border border-gray-200 px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{event.detail}</p>
                      <p className="mt-1 text-xs text-gray-500">{event.location}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                    You have not saved any events yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-bold text-gray-900">Registered Events</h2>
                <UserRound size={18} className="text-[#51237f]" />
              </div>
              <div className="p-6 space-y-4">
                {registeredEvents.length ? (
                  registeredEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border border-gray-200 px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{event.detail}</p>
                      <p className="mt-1 text-xs text-gray-500">{event.location}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                    You have not registered for any events yet.
                  </div>
                )}
              </div>
            </section>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
