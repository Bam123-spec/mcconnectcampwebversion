"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, LoaderCircle, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatJoinedLabel, formatOfficerRole, getClubInitials } from "@/lib/live-data";
import { getClubPath } from "@/lib/club-utils";

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

type ProfileRow = {
  full_name?: string | null;
  role?: string | null;
};

type MembershipSummary = {
  id: string;
  name: string;
  href: string;
  initials: string;
  joinedLabel: string;
  roleLabel: string;
  isLeadership: boolean;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export function CampusAccessPanel() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [memberships, setMemberships] = useState<MembershipSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setDisplayName(null);
          setIsPlatformAdmin(false);
          setMemberships([]);
          setLoading(false);
        }
        return;
      }

      const [profileResult, membershipsResult, officersResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("club_members")
          .select("id, club_id, clubs(name)")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .limit(6),
        supabase.from("officers").select("club_id, role").eq("user_id", user.id),
      ]);

      const profile = profileResult.data as ProfileRow | null;
      const officerMap = new Map<string, string>();
      for (const officer of officersResult.data ?? []) {
        if (officer.club_id) {
          officerMap.set(officer.club_id, officer.role ?? "Officer");
        }
      }

      const nextMemberships: MembershipSummary[] = ((membershipsResult.data ?? []) as MembershipRow[])
        .map((membership) => {
          const club = firstItem(membership.clubs);
          const clubName = club?.name;
          if (!clubName) return null;

          const officerRole = officerMap.get(membership.club_id);

          return {
            id: membership.id,
            name: clubName,
            href: getClubPath(membership.club_id),
            initials: getClubInitials(clubName),
            joinedLabel: formatJoinedLabel(),
            roleLabel: officerRole ? formatOfficerRole(officerRole) : "Member",
            isLeadership: Boolean(officerRole),
          };
        })
        .filter(Boolean) as MembershipSummary[];

      if (!cancelled) {
        setSignedIn(true);
        setDisplayName(profile?.full_name || user.email?.split("@")[0] || "Student");
        setIsPlatformAdmin(profile?.role === "admin");
        setMemberships(nextMemberships);
        setLoading(false);
      }
    };

    loadSummary();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSummary();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const leadershipCount = memberships.filter((membership) => membership.isLeadership).length;

  return (
    <section aria-labelledby="campus-access-heading" aria-busy={loading} className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">
          Your Campus Access
        </p>
        <h3 id="campus-access-heading" className="mt-2 text-xl font-bold tracking-[-0.02em] text-gray-950">
          Clubs, roles, and shortcuts tied to your account
        </h3>
      </div>

      <div>
        {loading ? (
          <div role="status" aria-live="polite" className="flex items-center gap-3 text-sm text-gray-500">
            <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
            Loading your clubs and access.
          </div>
        ) : !signedIn ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-gray-600">
              Sign in to see your joined clubs, officer roles, and shortcuts into the communities you manage.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-[#51237f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#45206b]"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {memberships.length} joined club{memberships.length === 1 ? "" : "s"}
                </span>
                {leadershipCount > 0 ? (
                  <span className="rounded-full bg-[#ede7f6] px-3 py-1 text-xs font-semibold text-[#51237f]">
                    {leadershipCount} leadership role{leadershipCount === 1 ? "" : "s"}
                  </span>
                ) : null}
                {isPlatformAdmin ? (
                  <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-semibold text-[#8a6116]">
                    Platform admin
                  </span>
                ) : null}
              </div>
            </div>

            {memberships.length ? (
              <div className="space-y-3">
                {memberships.map((membership) => (
                  <Link
                    key={membership.id}
                    href={membership.href}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 transition hover:border-[#d7cae8] hover:bg-[#faf8fd]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#51237f] text-xs font-black text-white">
                        {membership.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{membership.name}</p>
                        <p className="text-xs text-gray-500">
                          {membership.roleLabel}
                          {membership.joinedLabel ? ` · ${membership.joinedLabel}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {membership.isLeadership ? (
                        <ShieldCheck size={15} className="text-[#51237f]" />
                      ) : (
                        <Users size={15} className="text-gray-400" />
                      )}
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500">
                You haven&apos;t joined a club yet. Browse organizations to start building your campus footprint.
              </div>
            )}

            <Link
              href="/activity"
              className="inline-flex items-center text-sm font-semibold text-[#51237f] hover:underline"
            >
              View full activity
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
