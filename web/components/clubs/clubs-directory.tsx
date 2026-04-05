"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, ShieldCheck, Users } from "lucide-react";
import { getClubPath } from "@/lib/club-utils";
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {initialClubs.map((club) => {
        const viewerState = membershipState[club.id];
        const isMember = viewerState?.isMember ?? false;
        const officerRole = viewerState?.officerRole ?? null;

        return (
          <div
            key={club.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group"
          >
            <div className="h-24 w-full bg-gray-100 relative overflow-hidden">
              {club.coverImageUrl ? (
                <Image
                  src={club.coverImageUrl}
                  alt={club.name}
                  fill
                  className="object-cover"
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
            </div>

            <div className="px-6 pb-6 pt-0 flex-1 flex flex-col relative">
              <div
                className={`w-16 h-16 rounded-lg ${club.color} flex items-center justify-center text-white font-black text-2xl shadow-md border-4 border-white absolute -top-8 left-6 group-hover:scale-105 transition-transform`}
              >
                {club.initials}
              </div>

              <div className="mt-10 mb-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full tracking-wide uppercase">
                    {club.category}
                  </span>
                  {officerRole ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ede7f6] px-2.5 py-1 text-[11px] font-bold text-[#51237f]">
                      <ShieldCheck size={12} />
                      {formatOfficerRole(officerRole)}
                    </span>
                  ) : isMember ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                      <Users size={12} />
                      Joined
                    </span>
                  ) : null}
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-[#51237f] transition-colors line-clamp-2">
                  {club.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {club.description}
                </p>
              </div>

              <div className="mt-auto pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-[#51237f]" />
                    {club.members} Members
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#51237f]" />
                    {club.campus}
                  </div>
                </div>
                <Link
                  href={getClubPath(club.id)}
                  className="flex justify-center w-full py-2.5 bg-gray-50 hover:bg-[#51237f] hover:text-white text-gray-700 font-semibold rounded-md transition-colors border border-gray-200 hover:border-[#51237f]"
                >
                  {officerRole ? "Manage Club" : isMember ? "Open Club" : "View Profile"}
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
