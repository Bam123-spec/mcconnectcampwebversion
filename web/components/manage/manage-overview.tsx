"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BellDot,
  CalendarDays,
  LayoutDashboard,
  LoaderCircle,
  MessageSquare,
  Megaphone,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { getDisplayEventTurnout } from "@/lib/demo-analytics";
import { supabase } from "@/lib/supabase";
import { getClubPath } from "@/lib/club-utils";
import { formatEventDateLabel, formatOfficerRole, getClubColor, getClubInitials } from "@/lib/live-data";
import { hasOfficerCapability } from "@/lib/officer-capabilities";
import { cn } from "@/lib/utils";

type ProfileRow = {
  full_name?: string | null;
  role?: string | null;
};

type OfficerRow = {
  club_id: string;
  role?: string | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

type MemberRow = {
  user_id?: string | null;
  created_at?: string | null;
  profiles?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

type ClubEventRow = {
  id: string;
  name?: string | null;
  date?: string | null;
  day?: string | null;
  time?: string | null;
  created_at?: string | null;
};

type RegistrationRow = {
  event_id: string;
  created_at?: string | null;
};

type ActivityItem = {
  id: string;
  kind: "member" | "event" | "rsvp" | "system";
  title: string;
  detail: string;
  timeLabel: string;
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

const isWithinDays = (value: string | null | undefined, days: number, anchorTime: number) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const threshold = anchorTime - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= threshold;
};

export function ManageOverview() {
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [renderTime] = useState(() => Date.now());
  const [officerClubs, setOfficerClubs] = useState<
    Array<{ id: string; name: string; role: string; roleLabel: string; initials: string; color: string }>
  >([]);
  const [memberCount, setMemberCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [upcomingRsvpCount, setUpcomingRsvpCount] = useState(0);
  const [managedEvents, setManagedEvents] = useState<
    Array<{ id: string; name: string; dateLabel: string; status: "Upcoming" | "Past"; rsvps: number; createdAt: string | null }>
  >([]);
  const [managedMembers, setManagedMembers] = useState<
    Array<{ userId: string; name: string; isOfficer: boolean; roleLabel: string; isSelf: boolean; createdAt: string | null }>
  >([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadManageState = async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setDisplayName(null);
          setIsPlatformAdmin(false);
          setOfficerClubs([]);
          setLoading(false);
        }
        return;
      }

      const [profileResult, officersResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("officers")
          .select("club_id, role, clubs(name)")
          .eq("user_id", user.id)
          .limit(10),
      ]);

      const profile = profileResult.data as ProfileRow | null;
      const nextOfficerClubs = ((officersResult.data ?? []) as OfficerRow[])
        .map((officer) => {
          const club = firstItem(officer.clubs);
          if (!officer.club_id || !club?.name) return null;

          return {
            id: officer.club_id,
            name: club.name,
            role: officer.role || "officer",
            roleLabel: formatOfficerRole(officer.role),
            initials: getClubInitials(club.name),
            color: getClubColor(officer.club_id),
          };
        })
        .filter(Boolean) as Array<{ id: string; name: string; role: string; roleLabel: string; initials: string; color: string }>;

      if (!cancelled) {
        setSignedIn(true);
        setDisplayName(profile?.full_name || user.email?.split("@")[0] || "Student");
        setIsPlatformAdmin(profile?.role === "admin");
        setOfficerClubs(nextOfficerClubs);
        setSelectedClubId((current) => {
          if (current && nextOfficerClubs.some((club) => club.id === current)) {
            return current;
          }

          if (nextOfficerClubs.length === 1) {
            return nextOfficerClubs[0]?.id || "";
          }

          return "";
        });
        setLoading(false);
      }
    };

    loadManageState(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        loadManageState(event === "SIGNED_OUT");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (!selectedClubId) {
        setMemberCount(0);
        setEventCount(0);
        setUpcomingRsvpCount(0);
        setManagedEvents([]);
        setManagedMembers([]);
        setRecentActivity([]);
        return;
      }

      setDashboardLoading(true);
      setActionError(null);
      setActionSuccess(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setDashboardLoading(false);
        }
        return;
      }

      const [membersResult, officersResult, eventsResult] = await Promise.all([
        supabase
          .from("club_members")
          .select("user_id, created_at, profiles:user_id(full_name)")
          .eq("club_id", selectedClubId)
          .eq("status", "approved")
          .limit(200),
        supabase.from("officers").select("user_id, role").eq("club_id", selectedClubId),
        supabase
          .from("events")
          .select("id, name, date, day, time, created_at")
          .eq("club_id", selectedClubId)
          .order("date", { ascending: true, nullsFirst: false })
          .order("day", { ascending: true, nullsFirst: false })
          .limit(100),
      ]);

      const officerMap = new Map<string, string>();
      for (const officer of officersResult.data ?? []) {
        if (officer.user_id) {
          officerMap.set(officer.user_id, officer.role || "officer");
        }
      }

      const members = ((membersResult.data ?? []) as MemberRow[])
        .filter((member) => member.user_id)
        .map((member) => {
          const profile = firstItem(member.profiles);
          const rawRole = officerMap.get(member.user_id as string) || null;
          return {
            userId: member.user_id as string,
            name: profile?.full_name || "Member",
            isOfficer: Boolean(rawRole),
            roleLabel: rawRole ? "Officer" : "Member",
            isSelf: member.user_id === user.id,
            createdAt: member.created_at || null,
          };
        });

      const eventRows = (eventsResult.data ?? []) as ClubEventRow[];
      const eventIds = eventRows.map((event) => event.id).filter(Boolean);
      const { data: registrations } = eventIds.length
        ? await supabase
            .from("event_registrations")
            .select("event_id, created_at")
            .in("event_id", eventIds)
            .limit(5000)
        : { data: [] as RegistrationRow[] };

      const registrationCounts = new Map<string, number>();
      for (const row of registrations ?? []) {
        registrationCounts.set(row.event_id, (registrationCounts.get(row.event_id) ?? 0) + 1);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const events = eventRows.map((event) => {
        const resolvedDate = event.date || event.day || null;
        const parsed = resolvedDate ? new Date(resolvedDate) : null;
        const isUpcoming = parsed ? parsed.getTime() >= today.getTime() : true;

        return {
          id: event.id,
          name: event.name || "Club event",
          dateLabel: formatEventDateLabel(resolvedDate, event.time || null),
          status: isUpcoming ? ("Upcoming" as const) : ("Past" as const),
          rsvps: getDisplayEventTurnout({
            eventId: event.id,
            eventName: event.name,
            realCount: registrationCounts.get(event.id) ?? 0,
          }),
          createdAt: event.created_at || null,
        };
      });

      const upcomingRsvpsTotal = events
        .filter((event) => event.status === "Upcoming")
        .reduce((total, event) => total + event.rsvps, 0);
      const recentRegistrations = [...(registrations ?? [])]
        .filter((row) => row.created_at)
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      const registrationByEvent = new Map<string, RegistrationRow[]>();
      for (const row of recentRegistrations) {
        const rows = registrationByEvent.get(row.event_id) ?? [];
        rows.push(row);
        registrationByEvent.set(row.event_id, rows);
      }

      const activityItems: Array<ActivityItem & { sortKey: number }> = [];

      const newestMembers = [...members]
        .filter((member) => member.createdAt)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 2);
      for (const member of newestMembers) {
        activityItems.push({
          id: `member-${member.userId}`,
          kind: "member",
          title: `${member.name} joined the club`,
          detail: member.isOfficer ? "They currently appear in the officer roster." : "They are now part of the approved member list.",
          timeLabel: formatRelativeLabel(member.createdAt),
          sortKey: new Date(member.createdAt || 0).getTime(),
        });
      }

      const newestEvents = [...events]
        .filter((event) => event.createdAt)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 2);
      for (const event of newestEvents) {
        activityItems.push({
          id: `event-${event.id}`,
          kind: "event",
          title: `Created "${event.name}"`,
          detail: `${event.dateLabel} is now on the club calendar.`,
          timeLabel: formatRelativeLabel(event.createdAt),
          sortKey: new Date(event.createdAt || 0).getTime(),
        });
      }

      const rsvpHighlights = [...registrationByEvent.entries()]
        .map(([eventId, rows]) => {
          const event = events.find((item) => item.id === eventId);
          return event && rows[0]?.created_at
            ? {
                id: eventId,
                count: rows.length,
                name: event.name,
                createdAt: rows[0].created_at,
              }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b!.createdAt || 0).getTime() - new Date(a!.createdAt || 0).getTime())
        .slice(0, 2);

      for (const item of rsvpHighlights) {
        activityItems.push({
          id: `rsvp-${item!.id}`,
          kind: "rsvp",
          title: `${item!.count} new RSVP${item!.count === 1 ? "" : "s"} on "${item!.name}"`,
          detail: "Momentum is building around this event.",
          timeLabel: formatRelativeLabel(item!.createdAt),
          sortKey: new Date(item!.createdAt || 0).getTime(),
        });
      }

      if (!activityItems.length) {
        activityItems.push({
          id: "system-default",
          kind: "system",
          title: "Club analytics will build up here",
          detail: "As members join, events are created, and RSVPs come in, this feed will surface what needs attention.",
          timeLabel: "Waiting",
          sortKey: 0,
        });
      }

      if (!cancelled) {
        setMemberCount(members.length);
        setEventCount(events.length);
        setUpcomingRsvpCount(upcomingRsvpsTotal);
        setManagedEvents(events);
        setManagedMembers(members);
        setRecentActivity(activityItems.sort((a, b) => b.sortKey - a.sortKey).slice(0, 5));
        setDashboardLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [selectedClubId]);

  const selectedClub = officerClubs.find((club) => club.id === selectedClubId) ?? officerClubs[0] ?? null;
  const canCreateEvents = Boolean(selectedClub && (isPlatformAdmin || hasOfficerCapability(selectedClub.role, "createEvents")));
  const canManageMembers = Boolean(selectedClub && (isPlatformAdmin || hasOfficerCapability(selectedClub.role, "manageMembers")));
  const canManageRoles = Boolean(selectedClub && (isPlatformAdmin || hasOfficerCapability(selectedClub.role, "manageRoles")));
  const canEditClub = Boolean(selectedClub && (isPlatformAdmin || selectedClub.role));

  const handleDeleteEvent = async (eventId: string) => {
    if (!selectedClub) return;
    setActionError(null);
    setActionSuccess(null);

    const { error } = await supabase.from("events").delete().eq("id", eventId).eq("club_id", selectedClub.id);

    if (error) {
      setActionError(error.message || "Failed to delete event.");
      return;
    }

    const removed = managedEvents.find((event) => event.id === eventId);
    setActionSuccess("Event deleted.");
    setManagedEvents((current) => current.filter((event) => event.id !== eventId));
    setEventCount((count) => Math.max(0, count - 1));
    if (removed?.status === "Upcoming") {
      setUpcomingRsvpCount((count) => Math.max(0, count - removed.rsvps));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[24px] border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
        Loading your management access.
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Manage</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">Officer tools start after sign in</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Sign in with your campus account to see the clubs you manage and any leadership tools tied to your role.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center rounded-full bg-[#51237f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45206b]"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!officerClubs.length && !isPlatformAdmin) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Manage</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">No management access yet</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          This area appears when you are listed as an officer for a club or granted broader platform administration access.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/clubs"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
          >
            Browse Clubs
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
          >
            Support & Help
          </Link>
        </div>
      </div>
    );
  }

  if (officerClubs.length > 1 && !selectedClubId) {
    return (
      <div className="space-y-6">
        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.3)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Manage</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-gray-950">Choose a club to manage</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
            You have leadership access in multiple clubs. Pick the workspace you want to open right now.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {officerClubs.map((club) => (
              <button
                key={club.id}
                type="button"
                onClick={() => setSelectedClubId(club.id)}
                className="group rounded-[24px] border border-gray-200 bg-white p-5 text-left shadow-[0_18px_40px_-34px_rgba(17,24,39,0.24)] transition hover:-translate-y-0.5 hover:border-[#d8c8eb] hover:shadow-[0_22px_44px_-32px_rgba(17,24,39,0.28)]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] text-sm font-black text-white shadow-sm",
                      club.color
                    )}
                  >
                    {club.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold tracking-[-0.02em] text-gray-950">{club.name}</h2>
                      <span className="rounded-full bg-[#f4ecfb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f]">
                        {club.roleLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Open this club&apos;s dashboard, members, events, announcements, and analytics.
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-[#51237f]">
                      Open workspace
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const selectedRoleLabel = selectedClub?.roleLabel || (isPlatformAdmin ? "Platform Admin" : "Officer");
  const capabilityChips = [
    { label: "Create events", enabled: canCreateEvents },
    { label: "Manage members", enabled: canManageMembers },
    { label: "Assign roles", enabled: canManageRoles },
    { label: "Edit profile", enabled: canEditClub },
  ];
  const upcomingEventsCount = managedEvents.filter((event) => event.status === "Upcoming").length;
  const averageRsvpCount = eventCount
    ? Math.round((managedEvents.reduce((sum, event) => sum + event.rsvps, 0) / eventCount) * 10) / 10
    : 0;
  const officerCount = managedMembers.filter((member) => member.isOfficer).length;
  const memberGrowthCount = managedMembers.filter((member) => isWithinDays(member.createdAt, 30, renderTime)).length;
  const rsvpGrowthCount = managedEvents
    .filter((event) => event.status === "Upcoming")
    .reduce((sum, event) => sum + event.rsvps, 0);
  const leadershipCoverage = memberCount ? Math.round((officerCount / memberCount) * 100) : 0;
  const memberGrowthBars = Array.from({ length: 6 }, (_, index) => {
    const daysAgoStart = (5 - index) * 7;
    const weekStart = renderTime - (daysAgoStart + 7) * 24 * 60 * 60 * 1000;
    const weekEnd = renderTime - daysAgoStart * 24 * 60 * 60 * 1000;
    return managedMembers.filter((member) => {
      if (!member.createdAt) return false;
      const timestamp = new Date(member.createdAt).getTime();
      return timestamp >= weekStart && timestamp < weekEnd;
    }).length;
  });
  const maxMemberGrowth = Math.max(...memberGrowthBars, 1);
  const upcomingEventBars = managedEvents
    .filter((event) => event.status === "Upcoming")
    .slice(0, 5)
    .map((event) => ({ label: event.name, value: event.rsvps }));
  const maxUpcomingRsvps = Math.max(...upcomingEventBars.map((event) => event.value), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.3)] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f4ecfb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#51237f]">
                <LayoutDashboard size={13} />
                Club Dashboard
              </span>
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                {selectedRoleLabel}
              </span>
              {isPlatformAdmin ? (
                <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-semibold text-[#8a6116]">
                  Platform admin
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-start gap-4">
              {selectedClub ? (
                <div
                  className={cn(
                    "flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-lg font-black text-white shadow-sm",
                    selectedClub.color
                  )}
                >
                  {selectedClub.initials}
                </div>
              ) : null}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="text-3xl font-black tracking-[-0.03em] text-gray-950">
                    {selectedClub?.name || "Leadership Workspace"}
                  </h1>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {selectedRoleLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Welcome back, {displayName}. This control center keeps your club’s people, events, and activity in one fast-moving view.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl space-y-4">
            {officerClubs.length > 1 ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Active club</label>
                <select
                  value={selectedClub?.id || ""}
                  onChange={(event) => setSelectedClubId(event.target.value)}
                  className="mt-2 h-11 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-[#51237f]"
                >
                  {officerClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name} · {club.roleLabel}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  <Users size={14} className="text-[#51237f]" />
                  Members
                </div>
                <div className="mt-2 text-3xl font-black text-gray-950">{dashboardLoading ? "..." : memberCount}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  <CalendarDays size={14} className="text-[#51237f]" />
                  Events
                </div>
                <div className="mt-2 text-3xl font-black text-gray-950">{dashboardLoading ? "..." : eventCount}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  <ShieldCheck size={14} className="text-[#51237f]" />
                  RSVPs
                </div>
                <div className="mt-2 text-3xl font-black text-gray-950">{dashboardLoading ? "..." : upcomingRsvpCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-gray-200 pt-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-wrap gap-3">
            {selectedClub ? (
              <>
                <Link
                  href={canCreateEvents ? `/manage/events/new?clubId=${selectedClub.id}` : "/manage/events/new"}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                    canCreateEvents
                      ? "bg-[#51237f] text-white hover:bg-[#45206b]"
                      : "cursor-not-allowed border border-gray-200 bg-white text-gray-400"
                  )}
                >
                  <Plus size={15} />
                  Create event
                </Link>
                <Link
                  href={canEditClub ? `/manage/clubs/${selectedClub.id}/edit` : getClubPath(selectedClub.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                >
                  <Pencil size={15} />
                  Edit club
                </Link>
                <a
                  href="#manage-members"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                >
                  <Users size={15} />
                  View members
                </a>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
            <Link
              href="/manage/chats/members"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              <MessageSquare size={15} />
              Member chat
            </Link>
            <Link
              href="/manage/chats/leadership"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
            >
              <ShieldCheck size={15} />
              Leadership chat
            </Link>
          </div>
        </div>
      </section>

      {actionError ? (
        <p aria-live="assertive" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}
      {actionSuccess ? (
        <p aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionSuccess}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.3)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Club Pulse</p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950">
                  Events and turnout at a glance
                </h2>
              </div>
              {selectedClub ? (
                <Link
                  href={`/manage/events/new?clubId=${selectedClub.id}`}
                  className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                >
                  New event
                </Link>
              ) : null}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Member growth</p>
                    <p className="mt-2 text-2xl font-black text-gray-950">{dashboardLoading ? "..." : memberGrowthCount}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#51237f] shadow-sm">
                    <TrendingUp size={18} />
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">New approved members in the last 30 days.</p>
                <div className="mt-4 flex h-14 items-end gap-2">
                  {memberGrowthBars.map((value, index) => (
                    <div key={`member-growth-${index}`} className="flex-1 rounded-full bg-white/0">
                      <div
                        className="w-full rounded-full bg-[#51237f]/85"
                        style={{ height: `${Math.max(10, (value / maxMemberGrowth) * 100)}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">RSVP trend</p>
                    <p className="mt-2 text-2xl font-black text-gray-950">{dashboardLoading ? "..." : rsvpGrowthCount}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#51237f] shadow-sm">
                    <BarChart3 size={18} />
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Current RSVP pressure across upcoming events.</p>
                <div className="mt-4 space-y-2">
                  {upcomingEventBars.length ? (
                    upcomingEventBars.map((event) => (
                      <div key={event.label} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                          <span className="truncate">{event.label}</span>
                          <span>{event.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#51237f]"
                            style={{ width: `${Math.max(10, (event.value / maxUpcomingRsvps) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-5 text-sm text-gray-500">
                      Upcoming RSVP bars will appear once your club has active events.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Leadership coverage</p>
                    <p className="mt-2 text-2xl font-black text-gray-950">{dashboardLoading ? "..." : `${leadershipCoverage}%`}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#51237f] shadow-sm">
                    <ShieldCheck size={18} />
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Officer coverage across the current member roster.</p>
                <div className="mt-4 h-3 rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#51237f]"
                    style={{ width: `${Math.max(8, leadershipCoverage)}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">Officers</p>
                    <p className="mt-1 font-semibold text-gray-950">{officerCount}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">Upcoming</p>
                    <p className="mt-1 font-semibold text-gray-950">{upcomingEventsCount}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">Avg RSVPs</p>
                    <p className="mt-1 font-semibold text-gray-950">{averageRsvpCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <caption className="sr-only">Events managed by the selected club</caption>
                <thead className="bg-[#faf8fd]">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Event</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">When</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">RSVPs</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Status</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {managedEvents.length ? (
                    managedEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-950">{event.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{event.dateLabel}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{event.rsvps}</td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-semibold",
                              event.status === "Upcoming"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/manage/events/${event.id}/edit`}
                              aria-label={`Edit ${event.name}`}
                              className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                            >
                              <Pencil size={13} />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event.id)}
                              aria-label={`Delete ${event.name}`}
                              className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        No events for this club yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.3)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Recent Activity</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-gray-950">
                  What just happened
                </h2>
              </div>
              {dashboardLoading ? <span className="text-sm text-gray-400">Updating…</span> : null}
            </div>
            <div className="mt-5 space-y-3">
              {recentActivity.length ? (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#51237f] shadow-sm">
                      {item.kind === "member" ? (
                        <UserPlus size={18} />
                      ) : item.kind === "event" ? (
                        <CalendarDays size={18} />
                      ) : item.kind === "rsvp" ? (
                        <BellDot size={18} />
                      ) : (
                        <Activity size={18} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm font-semibold text-gray-950">{item.title}</p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                          {item.timeLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{item.detail}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fafafa] px-5 py-6 text-sm text-gray-600">
                  Activity will appear here as your club grows events and members.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.3)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Quick Actions</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-gray-950">
                  Move the club forward
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Start with the most important actions first, then use the capability states below to see what your current role can do.
                </p>
              </div>
            </div>

            {selectedClub ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href={canCreateEvents ? `/manage/events/new?clubId=${selectedClub.id}` : "/manage/events/new"}
                  className={cn(
                    "rounded-[24px] border px-5 py-5 transition-all",
                    canCreateEvents
                      ? "border-[#51237f] bg-[#51237f] text-white shadow-[0_18px_40px_-32px_rgba(81,35,127,0.85)] hover:bg-[#45206b]"
                      : "cursor-not-allowed border-gray-200 bg-white text-gray-400"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={cn(
                          "inline-flex h-11 w-11 items-center justify-center rounded-2xl",
                          canCreateEvents ? "bg-white/14 text-white" : "bg-gray-100 text-gray-400"
                        )}
                      >
                        <Plus size={18} />
                      </span>
                      <h3 className="mt-4 text-lg font-bold tracking-[-0.02em]">Create Event</h3>
                      <p className={cn("mt-1 text-sm leading-6", canCreateEvents ? "text-white/80" : "text-gray-500")}>
                        Launch a new event and start collecting RSVPs quickly.
                      </p>
                    </div>
                    <ArrowRight size={18} className={cn("mt-1 shrink-0", canCreateEvents ? "text-white" : "text-gray-400")} />
                  </div>
                </Link>
                <a
                  href="#manage-members"
                  className="group rounded-[24px] border border-gray-200 bg-[#fafafa] px-5 py-5 transition-colors hover:border-gray-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#51237f] shadow-sm">
                        <Users size={18} />
                      </span>
                      <h3 className="mt-4 text-lg font-bold tracking-[-0.02em] text-gray-950">View Members</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        See who is in the club and how they are involved.
                      </p>
                    </div>
                    <ArrowRight size={18} className="mt-1 shrink-0 text-gray-400 transition-colors group-hover:text-gray-700" />
                  </div>
                </a>
                <Link
                  href={canEditClub ? `/manage/clubs/${selectedClub.id}/edit` : getClubPath(selectedClub.id)}
                  className="group rounded-[24px] border border-gray-200 bg-[#fafafa] px-5 py-5 transition-colors hover:border-gray-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#51237f] shadow-sm">
                        <Pencil size={18} />
                      </span>
                      <h3 className="mt-4 text-lg font-bold tracking-[-0.02em] text-gray-950">Edit Club</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Update branding, details, and the public face of your club.
                      </p>
                    </div>
                    <ArrowRight size={18} className="mt-1 shrink-0 text-gray-400 transition-colors group-hover:text-gray-700" />
                  </div>
                </Link>
                <Link
                  href={selectedClub ? `/manage/announcements/new?clubId=${selectedClub.id}` : "/manage/announcements/new"}
                  className="group rounded-[24px] border border-gray-200 bg-[#fafafa] px-5 py-5 transition-colors hover:border-gray-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#51237f] shadow-sm">
                        <Megaphone size={18} />
                      </span>
                      <h3 className="mt-4 text-lg font-bold tracking-[-0.02em] text-gray-950">Send Announcement</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Broadcast updates and important notes to your club audience.
                      </p>
                    </div>
                    <ArrowRight size={18} className="mt-1 shrink-0 text-gray-400 transition-colors group-hover:text-gray-700" />
                  </div>
                </Link>
              </div>
            ) : null}

            <div className="mt-5 grid gap-3">
              {capabilityChips.map((chip) => (
                <div
                  key={chip.label}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm",
                    chip.enabled ? "border-emerald-200 bg-emerald-50/60" : "border-gray-200 bg-[#fafafa]"
                  )}
                >
                  <span className="font-semibold text-gray-900">{chip.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                      chip.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {chip.enabled ? "Enabled" : "Limited"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section id="manage-members" className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.3)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Members</p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950">
                  Member roster and involvement
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  A read-only view of who is in the club, their role, and when they joined.
                </p>
              </div>
              <span className="rounded-full bg-[#f4ecfb] px-3 py-1 text-xs font-semibold text-[#51237f]">
                {memberCount} total
              </span>
            </div>
            <div className="space-y-3">
              {managedMembers.length ? (
                managedMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-950">{member.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-sm text-gray-600">{member.roleLabel}</p>
                        <span className="rounded-full bg-[#faf5ff] px-2.5 py-1 text-[11px] font-semibold text-[#51237f]">
                          {member.isOfficer ? "Leadership" : "Member"}
                        </span>
                        {member.createdAt ? (
                          <span className="text-xs text-gray-500">Joined {formatRelativeLabel(member.createdAt)}</span>
                        ) : null}
                        {member.isSelf ? (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                            You
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full border border-gray-200 bg-[#fafafa] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      {member.isOfficer ? "Officer" : "Community"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fafafa] px-5 py-6 text-sm text-gray-600">
                  No approved members found for this club.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.3)]">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Comms</p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-gray-950">
                Stay in contact with your team
              </h2>
            </div>
            <div className="grid gap-3">
              <Link
                href="/manage/chats/members"
                className="flex items-center justify-between rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquare size={16} />
                  Member Chat
                </span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/manage/chats/leadership"
                className="flex items-center justify-between rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Leadership Chat
                </span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
