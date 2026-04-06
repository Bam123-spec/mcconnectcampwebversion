"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  Award,
  Bookmark,
  CalendarDays,
  Clock,
  Clock3,
  Download,
  LoaderCircle,
  MapPin,
  QrCode,
  ShieldCheck,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";
import { getClientCache, setClientCache } from "@/lib/client-cache";
import { supabase } from "@/lib/supabase";
import { formatEventDateLabel, formatJoinedLabel, formatOfficerRole, getClubInitials } from "@/lib/live-data";
import { getClubPath } from "@/lib/club-utils";
import { downloadEventCertificate } from "@/lib/event-certificate";

type ProfileRow = {
  full_name?: string | null;
  username?: string | null;
  major?: string | null;
  year?: string | null;
  role?: string | null;
  officer_title?: string | null;
  bio?: string | null;
};

type ActivityRegistration = {
  id: string;
  eventName: string;
  clubName: string;
  dateLabel: string;
  eventDate: string | null;
  eventTime: string | null;
  location: string;
  status: "Confirmed";
  isUpcoming: boolean;
  createdAt: string | null;
};

type ActivityMembership = {
  id: string;
  clubId: string;
  name: string;
  role: string;
  joinedLabel: string;
  initials: string;
  badgeTone: "officer" | "member";
  createdAt: string | null;
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
  created_at?: string | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

type OfficerActivityRow = {
  club_id?: string | null;
  role?: string | null;
  created_at?: string | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

type ActivityFeedItem = {
  id: string;
  kind: "join" | "rsvp" | "attendance" | "officer";
  title: string;
  context: string;
  timeLabel: string;
  timestamp: number;
};

type ActivityCachePayload = {
  email: string | null;
  profile: ProfileRow | null;
  registrations: ActivityRegistration[];
  memberships: ActivityMembership[];
  savedEvents: SavedEvent[];
  activityFeed: ActivityFeedItem[];
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const formatRelativeLabel = (value?: string | null) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function ActivityPanel() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [registrations, setRegistrations] = useState<ActivityRegistration[]>([]);
  const [memberships, setMemberships] = useState<ActivityMembership[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [certificateRegistrationId, setCertificateRegistrationId] = useState<string | null>(null);
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
          setEmail(null);
          setProfile(null);
          setRegistrations([]);
          setMemberships([]);
          setSavedEvents([]);
          setActivityFeed([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setSignedIn(true);
      }

      const cacheKey = `activity:${user.id}`;
      const cachedActivity = getClientCache<ActivityCachePayload>(cacheKey);

      if (cachedActivity && !cancelled) {
        setEmail(cachedActivity.email);
        setProfile(cachedActivity.profile);
        setRegistrations(cachedActivity.registrations);
        setMemberships(cachedActivity.memberships);
        setSavedEvents(cachedActivity.savedEvents);
        setActivityFeed(cachedActivity.activityFeed);
        setLoading(false);
      }

      const [profileResult, registrationsResult, membershipsResult, officersResult, savedEventsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("event_registrations")
          .select("id, created_at, event:events(name, location, date, day, time, clubs(name))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("club_members")
          .select("id, club_id, created_at, clubs(name)")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .limit(8),
        supabase
          .from("officers")
          .select("club_id, role, created_at, clubs(name)")
          .eq("user_id", user.id),
        supabase
          .from("event_saved")
          .select("id, event:events(name, location, date, day, time)")
          .eq("user_id", user.id)
          .limit(6),
      ]);

      if (profileResult.error || registrationsResult.error || membershipsResult.error || officersResult.error || savedEventsResult.error) {
        if (!cancelled) {
          setError(
            profileResult.error?.message ||
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
            eventDate,
            eventTime: event.time || null,
            location: event.location || "Location TBA",
            status: "Confirmed",
            isUpcoming: parsedDate ? parsedDate >= new Date() : true,
            createdAt: registration.created_at || null,
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
            clubId: membership.club_id,
            name: clubName,
            role: officerRole ? `${formatOfficerRole(officerRole)} (Officer)` : "Member",
            joinedLabel: formatJoinedLabel(),
            initials: getClubInitials(clubName),
            badgeTone: officerRole ? "officer" : "member",
            createdAt: membership.created_at || null,
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

      const officerTimeline = ((officersResult.data ?? []) as OfficerActivityRow[])
        .map((officer) => {
          const club = firstItem(officer.clubs);
          if (!officer.club_id || !club?.name) return null;

          return {
            id: officer.club_id,
            clubName: club.name,
            roleLabel: formatOfficerRole(officer.role),
            createdAt: officer.created_at || null,
          };
        })
        .filter(Boolean) as Array<{ id: string; clubName: string; roleLabel: string; createdAt: string | null }>;

      const feedItems: ActivityFeedItem[] = [];

      for (const membership of nextMemberships) {
        feedItems.push({
          id: `join-${membership.id}`,
          kind: "join",
          title: "Joined a club",
          context: `${membership.name} · ${membership.role}`,
          timeLabel: formatRelativeLabel(membership.createdAt),
          timestamp: membership.createdAt ? new Date(membership.createdAt).getTime() : 0,
        });
      }

      for (const registration of nextRegistrations) {
        feedItems.push({
          id: `${registration.isUpcoming ? "rsvp" : "attended"}-${registration.id}`,
          kind: registration.isUpcoming ? "rsvp" : "attendance",
          title: registration.isUpcoming ? "RSVP'd to an event" : "Attended an event",
          context: `${registration.eventName} · ${registration.clubName}`,
          timeLabel: formatRelativeLabel(registration.createdAt),
          timestamp: registration.createdAt ? new Date(registration.createdAt).getTime() : 0,
        });
      }

      for (const officer of officerTimeline) {
        feedItems.push({
          id: `officer-${officer.id}`,
          kind: "officer",
          title: "Became an officer",
          context: `${officer.roleLabel} · ${officer.clubName}`,
          timeLabel: formatRelativeLabel(officer.createdAt),
          timestamp: officer.createdAt ? new Date(officer.createdAt).getTime() : 0,
        });
      }

      const nextActivityFeed = feedItems.sort((a, b) => b.timestamp - a.timestamp);
      const nextProfile = (profileResult.data as ProfileRow | null) ?? null;
      const nextEmail = user.email ?? null;
      const nextPayload: ActivityCachePayload = {
        email: nextEmail,
        profile: nextProfile,
        registrations: nextRegistrations,
        memberships: nextMemberships,
        savedEvents: nextSavedEvents,
        activityFeed: nextActivityFeed,
      };

      if (!cancelled) {
        setEmail(nextEmail);
        setProfile(nextProfile);
        setRegistrations(nextRegistrations);
        setMemberships(nextMemberships);
        setSavedEvents(nextSavedEvents);
        setActivityFeed(nextActivityFeed);
        setLoading(false);
      }

      setClientCache(cacheKey, nextPayload);
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
  const displayName = profile?.full_name || email?.split("@")[0] || "Student";
  const subtitleParts = [profile?.major, profile?.year].filter(Boolean);
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-16">
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
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sign in to view your activity</h1>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              Your Montgomery College profile, memberships, RSVPs, and officer access will appear here once you sign in.
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

  const upcomingRegistrations = registrations.filter((registration) => registration.isUpcoming);
  const attendedCount = Math.max(0, registrations.length - upcomingRegistrations.length);
  const recommendations = [
    memberships.length < 3
      ? {
          id: "join-clubs",
          title: "Join more clubs",
          description: "Expand your campus circle by joining a few more communities that match your interests.",
          href: "/clubs",
          cta: "Browse clubs",
          icon: Users,
        }
      : null,
    upcomingRegistrations.length === 0
      ? {
          id: "attend-week",
          title: "Attend an event this week",
          description: "You do not have anything upcoming yet. Pick one event this week and lock it in.",
          href: "/events",
          cta: "Find events",
          icon: Ticket,
        }
      : null,
    savedEvents.length === 0
      ? {
          id: "explore-trending",
          title: "Explore trending events",
          description: "Browse popular events and save a few so your next week has a plan.",
          href: "/events",
          cta: "See trending",
          icon: Bookmark,
        }
      : null,
    leadershipCount === 0 && memberships.length > 0
      ? {
          id: "leadership",
          title: "Look for leadership opportunities",
          description: "You are active in clubs already. Explore where you might step into a bigger role.",
          href: "/clubs",
          cta: "View communities",
          icon: ShieldCheck,
        }
      : null,
    {
      id: "campus-momentum",
      title: "Keep your campus momentum going",
      description: "Check the latest events and announcements so your dashboard stays active through the week.",
      href: "/events",
      cta: "Open events",
      icon: Award,
    },
  ].filter(Boolean).slice(0, 3) as Array<{
    id: string;
    title: string;
    description: string;
    href: string;
    cta: string;
    icon: typeof Users;
  }>;

  const handleDownloadCertificate = async (registration: ActivityRegistration) => {
    try {
      setCertificateRegistrationId(registration.id);
      await downloadEventCertificate({
        studentName: displayName,
        eventName: registration.eventName,
        clubName: registration.clubName,
        dateLabel: registration.dateLabel,
        eventDate: registration.eventDate,
        eventTime: registration.eventTime,
        location: registration.location,
      });
    } finally {
      setCertificateRegistrationId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.18)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#51237f] text-xl font-black text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Student dashboard</p>
                  <h1 className="mt-1 text-3xl font-black tracking-[-0.03em] text-gray-950">{displayName}</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Montgomery College
                    {subtitleParts.length ? ` · ${subtitleParts.join(" · ")}` : ""}
                  </p>
                  {email ? <p className="mt-1 text-sm text-gray-500">{email}</p> : null}
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

            <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  <Ticket size={14} className="text-[#51237f]" />
                  Events attended
                </div>
                <div className="mt-2 text-3xl font-black text-gray-950">{attendedCount}</div>
                <p className="mt-1 text-sm text-gray-500">Past campus events you checked into.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  <Users size={14} className="text-[#51237f]" />
                  Clubs joined
                </div>
                <div className="mt-2 text-3xl font-black text-gray-950">{memberships.length}</div>
                <p className="mt-1 text-sm text-gray-500">Active communities in your dashboard.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  <ShieldCheck size={14} className="text-[#51237f]" />
                  Leadership roles
                </div>
                <div className="mt-2 text-3xl font-black text-gray-950">{leadershipCount}</div>
                <p className="mt-1 text-sm text-gray-500">Officer or leadership access you hold.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  <Bookmark size={14} className="text-[#51237f]" />
                  Saved events
                </div>
                <div className="mt-2 text-3xl font-black text-gray-950">{savedEvents.length}</div>
                <p className="mt-1 text-sm text-gray-500">Things you want to come back to soon.</p>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-200 pt-5">
              {profile?.bio ? (
                <p className="max-w-3xl text-sm leading-7 text-gray-600">{profile.bio}</p>
              ) : (
                <p className="max-w-3xl text-sm leading-7 text-gray-600">
                  Your personal dashboard keeps registrations, memberships, saved events, and leadership access in one place so you can check in quickly every day.
                </p>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_50px_-40px_rgba(17,24,39,0.18)]">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Registered events</p>
                    <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950">Upcoming and past RSVPs</h2>
                  </div>
                  <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
                    Browse Events
                  </Link>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  {registrations.length ? registrations.map((registration) => (
                    <div
                      key={registration.id}
                      className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 sm:flex-row"
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-green-800">
                            {registration.status}
                          </span>
                          <span className="text-xs font-medium text-gray-500">{registration.clubName}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-950">{registration.eventName}</h3>
                        <div className="mt-3 flex flex-col gap-2 text-sm font-medium text-gray-600 sm:flex-row sm:items-center sm:gap-6">
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

                      <div className="flex items-center gap-3 border-t border-gray-200 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-400">
                          {registration.isUpcoming ? <QrCode size={28} /> : <Clock3 size={28} />}
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-[#51237f]">
                            {registration.isUpcoming ? "Event Pass" : "Attended"}
                          </span>
                          {!registration.isUpcoming ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadCertificate(registration)}
                              disabled={certificateRegistrationId === registration.id}
                              className="inline-flex items-center gap-2 rounded-xl border border-[#d8c8ea] bg-[#f7f2fb] px-3.5 py-2 text-sm font-semibold text-[#51237f] transition-colors hover:bg-[#efe6f8] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {certificateRegistrationId === registration.id ? (
                                <LoaderCircle size={16} className="animate-spin" />
                              ) : (
                                <Download size={16} />
                              )}
                              {certificateRegistrationId === registration.id ? "Preparing PDF" : "Download certificate"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                      <h3 className="text-lg font-bold text-gray-900">No event registrations yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Once you RSVP to events, they’ll appear here.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_50px_-40px_rgba(17,24,39,0.18)]">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Communities</p>
                    <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950">Your clubs and roles</h2>
                  </div>
                  <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
                    Find Groups
                  </Link>
                </div>
                <ul className="divide-y divide-gray-100">
                  {memberships.length ? memberships.map((membership) => (
                    <li key={membership.id} className="flex items-center gap-4 p-6 transition-colors hover:bg-gray-50">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#51237f] text-lg font-black text-white shadow-sm">
                        {membership.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={getClubPath(membership.clubId)}
                          className="text-base font-bold text-gray-900 truncate hover:text-[#51237f]"
                        >
                          {membership.name}
                        </Link>
                        <div className="mt-0.5 text-sm text-gray-500">{membership.joinedLabel}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
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
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                        <h3 className="text-lg font-bold text-gray-900">No club memberships yet</h3>
                        <p className="mt-2 text-sm text-gray-500">Join a club to start building your campus dashboard.</p>
                      </div>
                    </li>
                  )}
                </ul>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.18)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Snapshot</p>
                    <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950">Your weekly pace</h2>
                  </div>
                  <Award size={18} className="text-[#51237f]" />
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-600">Upcoming RSVPs</span>
                      <span className="text-2xl font-black text-gray-950">{upcomingRegistrations.length}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#51237f]"
                        style={{ width: `${Math.max(12, registrations.length ? (upcomingRegistrations.length / registrations.length) * 100 : 12)}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-600">Leadership presence</span>
                      <span className="text-2xl font-black text-gray-950">{leadershipCount}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {leadershipCount
                        ? "You currently hold officer access in one or more clubs."
                        : "No leadership roles assigned right now."}
                    </p>
                  </div>
                </div>

                <Link
                  href="/events"
                  className="mt-5 block w-full rounded-xl bg-[#51237f] py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#45206b]"
                >
                  Explore More Events
                </Link>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_50px_-40px_rgba(17,24,39,0.18)]">
                <div className="border-b border-gray-100 px-6 py-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Recommended</p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950">Next steps for you</h2>
                </div>
                <div className="p-6 space-y-3">
                  {recommendations.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#51237f] shadow-sm">
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-gray-950">{item.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-gray-600">{item.description}</p>
                            <Link
                              href={item.href}
                              className="mt-3 inline-flex rounded-full bg-[#51237f] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#45206b]"
                            >
                              {item.cta}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_50px_-40px_rgba(17,24,39,0.18)]">
                <div className="border-b border-gray-100 px-6 py-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Activity</p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950">Recent timeline</h2>
                </div>
                <div className="p-6 space-y-3">
                  {activityFeed.length ? (
                    activityFeed.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-gray-200 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f4ecfb] text-[#51237f]">
                            {item.kind === "join" ? (
                              <UserPlus size={18} />
                            ) : item.kind === "officer" ? (
                              <ShieldCheck size={18} />
                            ) : item.kind === "attendance" ? (
                              <CalendarDays size={18} />
                            ) : (
                              <Activity size={18} />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <h3 className="text-sm font-bold text-gray-950">{item.title}</h3>
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                                {item.timeLabel}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-gray-600">{item.context}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                      <h3 className="text-lg font-bold text-gray-900">No recent activity yet</h3>
                      <p className="mt-2 text-sm text-gray-500">As you join clubs and RSVP to events, your activity feed will start filling in here.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_50px_-40px_rgba(17,24,39,0.18)]">
                <div className="border-b border-gray-100 px-6 py-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Saved</p>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950">Events you bookmarked</h2>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  {savedEvents.length ? (
                    savedEvents.map((event) => (
                      <div key={event.id} className="rounded-2xl border border-gray-200 px-4 py-4">
                        <div className="font-bold text-gray-950">{event.name}</div>
                        <div className="mt-2 text-sm text-gray-500">{event.dateLabel}</div>
                        <div className="mt-1 text-sm text-gray-500">{event.location}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                      <h3 className="text-lg font-bold text-gray-900">No saved events yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Save events from the campus feed to come back to them later.</p>
                    </div>
                  )}

                  {error ? (
                    <div aria-live="assertive" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                      {error}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
