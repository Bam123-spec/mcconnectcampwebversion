"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getClubPath } from "@/lib/club-utils";
import { formatOfficerRole, getClubColor, getClubInitials } from "@/lib/live-data";

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

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export function ManageOverview() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [officerClubs, setOfficerClubs] = useState<
    Array<{ id: string; name: string; roleLabel: string; initials: string; color: string }>
  >([]);

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
            roleLabel: formatOfficerRole(officer.role),
            initials: getClubInitials(club.name),
            color: getClubColor(officer.club_id),
          };
        })
        .filter(Boolean) as Array<{ id: string; name: string; roleLabel: string; initials: string; color: string }>;

      if (!cancelled) {
        setSignedIn(true);
        setDisplayName(profile?.full_name || user.email?.split("@")[0] || "Student");
        setIsPlatformAdmin(profile?.role === "admin");
        setOfficerClubs(nextOfficerClubs);
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
          Open the clubs you lead, review member-facing pages, and move between leadership surfaces without jumping through student navigation.
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
      </section>

      {officerClubs.length ? (
        <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Your Clubs</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950">
              Clubs you currently manage
            </h2>
          </div>
          <div className="space-y-3">
            {officerClubs.map((club) => (
              <Link
                key={club.id}
                href={getClubPath(club.id)}
                className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 transition hover:border-[#d7cae8] hover:bg-[#faf8fd]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white ${club.color}`}
                  >
                    {club.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-gray-950">{club.name}</p>
                    <p className="mt-1 text-sm text-gray-600">{club.roleLabel}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#51237f]">
                  <ShieldCheck size={15} />
                  Open
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/events"
          className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)] transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Events</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-gray-950">Review event listings</h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Jump into current event pages and check how your programs are appearing to students.
          </p>
        </Link>
        <Link
          href="/activity"
          className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)] transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Activity</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-gray-950">Track your involvement</h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            See your memberships, RSVPs, and saved items alongside the clubs you help lead.
          </p>
        </Link>
        <Link
          href="/docs"
          className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)] transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#51237f]">Support</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-gray-950">Keep help close</h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Open docs and guidance without losing your management view when you need a quick reference.
          </p>
        </Link>
      </section>
    </div>
  );
}
