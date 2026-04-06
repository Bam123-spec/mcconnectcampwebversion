"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, ShieldCheck, Users } from "lucide-react";
import { getClubPath } from "@/lib/club-utils";
import { getClientCache, setClientCache } from "@/lib/client-cache";
import { supabase } from "@/lib/supabase";

type ClubCardData = {
  id: string;
  name: string;
  description: string;
  members: number;
  campus: string;
  category: string;
  initials: string;
  color: string;
  coverImageUrl: string | null;
};

type ClubMembershipState = {
  isMember: boolean;
  officerRole: string | null;
};

const formatOfficerRole = (value?: string | null) => {
  if (!value) return "";

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

export function ClubsDirectory({ initialClubs }: { initialClubs: ClubCardData[] }) {
  const [membershipState, setMembershipState] = useState<Record<string, ClubMembershipState>>({});

  useEffect(() => {
    let cancelled = false;

    const loadMembershipState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setMembershipState({});
        }
        return;
      }

      const clubIds = initialClubs.map((club) => club.id);
      if (!clubIds.length) return;
      const cacheKey = `clubs-membership:${user.id}:${clubIds.join(",")}`;
      const cachedState = getClientCache<Record<string, ClubMembershipState>>(cacheKey);

      if (cachedState && !cancelled) {
        setMembershipState(cachedState);
      }

      const [membershipsResult, officersResult] = await Promise.all([
        supabase
          .from("club_members")
          .select("club_id")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .in("club_id", clubIds),
        supabase
          .from("officers")
          .select("club_id, role")
          .eq("user_id", user.id)
          .in("club_id", clubIds),
      ]);

      if (cancelled) return;

      const nextState: Record<string, ClubMembershipState> = {};

      for (const membership of membershipsResult.data ?? []) {
        nextState[membership.club_id] = {
          isMember: true,
          officerRole: nextState[membership.club_id]?.officerRole ?? null,
        };
      }

      for (const officer of officersResult.data ?? []) {
        nextState[officer.club_id] = {
          isMember: nextState[officer.club_id]?.isMember ?? true,
          officerRole: officer.role ?? null,
        };
      }

      setClientCache(cacheKey, nextState);
      setMembershipState(nextState);
    };

    loadMembershipState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadMembershipState();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [initialClubs]);

  return (
    <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {initialClubs.map((club) => {
        const viewerState = membershipState[club.id];
        const isMember = viewerState?.isMember ?? false;
        const officerRole = viewerState?.officerRole ?? null;

        return (
          <article
            key={club.id}
            className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_14px_30px_-26px_rgba(17,24,39,0.22)] transition hover:-translate-y-1 hover:shadow-[0_22px_40px_-24px_rgba(17,24,39,0.28)]"
          >
            <div className="relative h-44 w-full overflow-hidden bg-gray-100">
              {club.coverImageUrl ? (
                <Image
                  src={club.coverImageUrl}
                  alt={club.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, gray 1px, transparent 0)",
                    backgroundSize: "16px 16px",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
              <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f] shadow-sm backdrop-blur">
                  {club.category}
                </span>
                {officerRole ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#51237f]/92 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
                    <ShieldCheck size={12} />
                    {formatOfficerRole(officerRole)}
                  </span>
                ) : isMember ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/92 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
                    <Users size={12} />
                    Joined
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative flex flex-1 flex-col px-6 pb-6 pt-0">
              <div
                className={`absolute -top-8 left-6 flex h-16 w-16 items-center justify-center rounded-2xl ${club.color} border-4 border-white text-2xl font-black text-white shadow-md transition-transform group-hover:scale-105`}
              >
                {club.initials}
              </div>

              <div className="mb-4 mt-10">
                <h3
                  id={`club-card-${club.id}`}
                  className="line-clamp-2 text-xl font-bold leading-tight text-gray-950 transition-colors group-hover:text-[#51237f]"
                >
                  {club.name}
                </h3>
                <p className="mt-3 line-clamp-1 text-sm leading-6 text-gray-600">
                  {club.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    {club.members} members
                  </span>
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                    {club.campus}
                  </span>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-100 pt-5">
                <Link
                  href={getClubPath(club.id)}
                  aria-labelledby={`club-card-${club.id}`}
                  aria-label={`${officerRole ? "Manage" : isMember ? "View" : "Join"} ${club.name}`}
                  className={`flex h-11 w-full items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                    officerRole
                      ? "border-[#51237f] bg-[#51237f] text-white hover:bg-[#45206b]"
                      : isMember
                        ? "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                        : "border-[#51237f] bg-[#51237f] text-white hover:bg-[#45206b]"
                  }`}
                >
                  {officerRole ? "Manage Club" : isMember ? "View Club" : "Join Club"}
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
