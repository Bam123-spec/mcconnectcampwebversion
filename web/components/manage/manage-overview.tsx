"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, ShieldCheck, Pencil, Plus, Users, Trash2 } from "lucide-react";
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
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
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
  const [officerClubs, setOfficerClubs] = useState<
    Array<{ id: string; name: string; role: string; roleLabel: string; initials: string; color: string }>
  >([]);
  const [memberCount, setMemberCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [upcomingRsvpCount, setUpcomingRsvpCount] = useState(0);
  const [managedEvents, setManagedEvents] = useState<
    Array<{ id: string; name: string; dateLabel: string; status: "Upcoming" | "Past"; rsvps: number }>
  >([]);
  const [managedMembers, setManagedMembers] = useState<
    Array<{ userId: string; name: string; isOfficer: boolean; roleLabel: string; isSelf: boolean }>
  >([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadManageState = async () => {
      setLoading(true);

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
        setSelectedClubId((current) => current || nextOfficerClubs[0]?.id || "");
        setLoading(false);
      }
    };

    loadManageState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadManageState();
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
          .select("user_id, profiles:user_id(full_name)")
          .eq("club_id", selectedClubId)
          .eq("status", "approved")
          .limit(200),
        supabase.from("officers").select("user_id, role").eq("club_id", selectedClubId),
        supabase
          .from("events")
          .select("id, name, date, day, time")
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
          };
        });

      const eventRows = (eventsResult.data ?? []) as ClubEventRow[];
      const eventIds = eventRows.map((event) => event.id).filter(Boolean);
      const { data: registrations } = eventIds.length
        ? await supabase
            .from("event_registrations")
            .select("event_id")
            .in("event_id", eventIds)
            .limit(5000)
        : { data: [] as Array<{ event_id: string }> };

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
          rsvps: registrationCounts.get(event.id) ?? 0,
        };
      });

      const nextActivity: string[] = [];
      if (events[0]) {
        nextActivity.push(`Latest event on the board: "${events[0].name}"`);
      }
      const upcomingRsvpsTotal = events
        .filter((event) => event.status === "Upcoming")
        .reduce((total, event) => total + event.rsvps, 0);
      if (upcomingRsvpsTotal > 0) {
        nextActivity.push(`${upcomingRsvpsTotal} RSVPs across upcoming events`);
      }
      if (members.length > 0) {
        nextActivity.push(`${members.length} approved members currently in this club`);
      }

      if (!cancelled) {
        setMemberCount(members.length);
        setEventCount(events.length);
        setUpcomingRsvpCount(upcomingRsvpsTotal);
        setManagedEvents(events);
        setManagedMembers(members);
        setRecentActivity(nextActivity.slice(0, 3));
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

  const handlePromote = async (userId: string) => {
    if (!selectedClub) return;
    setActionError(null);
    setActionSuccess(null);

    const { error } = await supabase.from("officers").upsert(
      [{ user_id: userId, club_id: selectedClub.id, role: "officer" }],
      { onConflict: "user_id,club_id" }
    );

    if (error) {
      setActionError(error.message || "Failed to promote member.");
      return;
    }

    setActionSuccess("Member promoted to officer.");
    setManagedMembers((current) =>
      current.map((member) =>
        member.userId === userId ? { ...member, isOfficer: true, roleLabel: "Officer" } : member
      )
    );
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedClub) return;
    setActionError(null);
    setActionSuccess(null);

    const { error } = await supabase
      .from("club_members")
      .delete()
      .eq("club_id", selectedClub.id)
      .eq("user_id", userId);

    if (error) {
      setActionError(error.message || "Failed to remove member.");
      return;
    }

    setActionSuccess("Member removed from club.");
    setManagedMembers((current) => current.filter((member) => member.userId !== userId));
    setMemberCount((count) => Math.max(0, count - 1));
  };

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

  return (
    <div className="space-y-8">
      <section className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Manage</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">
          Leadership access for {displayName}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Run your club from one place with event controls, member management, and officer messaging tied to the club you lead.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {officerClubs.length ? (
            <span className="rounded-full bg-[#ede7f6] px-3 py-1 text-xs font-semibold text-[#51237f]">
              {officerClubs.length} leadership role{officerClubs.length === 1 ? "" : "s"}
            </span>
          ) : null}
          {isPlatformAdmin ? (
            <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-semibold text-[#8a6116]">
              Platform admin
            </span>
          ) : null}
        </div>

        {officerClubs.length > 1 ? (
          <div className="mt-6 max-w-sm">
            <label className="block text-sm font-semibold text-gray-900">Active club</label>
            <select
              value={selectedClub?.id || ""}
              onChange={(event) => setSelectedClubId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#51237f]"
            >
              {officerClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} · {club.roleLabel}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {selectedClub ? (
          <>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={canCreateEvents ? `/manage/events/new?clubId=${selectedClub.id}` : "/manage/events/new"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors",
                  canCreateEvents ? "bg-[#51237f] text-white hover:bg-[#45206b]" : "border border-gray-300 text-gray-400"
                )}
              >
                <Plus size={16} />
                Create Event
              </Link>
              <Link
                href={canEditClub ? `/manage/clubs/${selectedClub.id}/edit` : getClubPath(selectedClub.id)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                <Pencil size={16} />
                Edit Club
              </Link>
              <a
                href="#manage-members"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                <Users size={16} />
                Manage Members
              </a>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <Link href="/manage/chats/members" className="font-semibold text-[#51237f] hover:underline">
                Open member chat
              </Link>
              <Link href="/manage/chats/leadership" className="font-semibold text-[#51237f] hover:underline">
                Open leadership chat
              </Link>
            </div>
          </>
        ) : null}
      </section>

      {actionError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      ) : null}
      {actionSuccess ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionSuccess}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-[#51237f]" />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Members</p>
          </div>
          <p className="mt-4 text-4xl font-bold tracking-[-0.03em] text-gray-950">
            {dashboardLoading ? "..." : memberCount}
          </p>
          <p className="mt-2 text-sm text-gray-600">Approved members in the selected club.</p>
        </div>
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
          <div className="flex items-center gap-3">
            <Plus size={18} className="text-[#51237f]" />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Events Hosted</p>
          </div>
          <p className="mt-4 text-4xl font-bold tracking-[-0.03em] text-gray-950">
            {dashboardLoading ? "..." : eventCount}
          </p>
          <p className="mt-2 text-sm text-gray-600">Current events tied to this club.</p>
        </div>
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-[#51237f]" />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Upcoming RSVPs</p>
          </div>
          <p className="mt-4 text-4xl font-bold tracking-[-0.03em] text-gray-950">
            {dashboardLoading ? "..." : upcomingRsvpCount}
          </p>
          <p className="mt-2 text-sm text-gray-600">Confirmed interest across upcoming events.</p>
        </div>
      </section>

      <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Events</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950">
              Events you are managing
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
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#faf8fd]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Event Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">RSVPs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Actions</th>
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
                          className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                        >
                          <Pencil size={13} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event.id)}
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

      <section id="manage-members" className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Members</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950">
            Manage people quickly
          </h2>
        </div>
        <div className="space-y-3">
          {managedMembers.length ? (
            managedMembers.map((member) => (
              <div
                key={member.userId}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-gray-950">{member.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{member.roleLabel}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!canManageRoles || member.isOfficer || member.isSelf}
                    onClick={() => handlePromote(member.userId)}
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      !canManageRoles || member.isOfficer || member.isSelf
                        ? "cursor-not-allowed border border-gray-200 text-gray-400"
                        : "border border-gray-300 text-gray-800 hover:bg-gray-50"
                    )}
                  >
                    Promote
                  </button>
                  <button
                    type="button"
                    disabled={!canManageMembers || member.isSelf}
                    onClick={() => handleRemoveMember(member.userId)}
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      !canManageMembers || member.isSelf
                        ? "cursor-not-allowed border border-gray-200 text-gray-400"
                        : "border border-red-200 text-red-700 hover:bg-red-50"
                    )}
                  >
                    Remove
                  </button>
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

      <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Recent Activity</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950">
            Progress inside your club
          </h2>
        </div>
        <div className="space-y-3">
          {recentActivity.length ? (
            recentActivity.map((item) => (
              <div key={item} className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-4 text-sm text-gray-700">
                {item}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fafafa] px-5 py-6 text-sm text-gray-600">
              Activity will appear here as you grow events and members in this club.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
