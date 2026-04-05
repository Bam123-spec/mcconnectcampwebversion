"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_ENABLED } from "@/lib/features";
import { supabase } from "@/lib/supabase";

type ProfileRow = {
  full_name?: string | null;
  role?: string | null;
};

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [joinedClubCount, setJoinedClubCount] = useState(0);
  const [leadershipCount, setLeadershipCount] = useState(0);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setUserEmail(null);
          setDisplayName(null);
          setJoinedClubCount(0);
          setLeadershipCount(0);
          setIsPlatformAdmin(false);
        }
        return;
      }

      const [profileResult, membershipsResult, officersResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("club_members")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "approved"),
        supabase.from("officers").select("club_id").eq("user_id", user.id),
      ]);

      if (!cancelled) {
        const profile = profileResult.data as ProfileRow | null;
        setUserEmail(user.email ?? null);
        setDisplayName(profile?.full_name || user.email?.split("@")[0] || null);
        setJoinedClubCount(membershipsResult.data?.length ?? 0);
        setLeadershipCount(officersResult.data?.length ?? 0);
        setIsPlatformAdmin(profile?.role === "admin");
      }
    };

    syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncUser();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setDisplayName(null);
    setJoinedClubCount(0);
    setLeadershipCount(0);
    setIsPlatformAdmin(false);
    router.push("/");
    router.refresh();
    setIsSigningOut(false);
  };

  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="w-full h-[60px] bg-white border-b border-gray-300 flex items-stretch top-0 sticky z-50 shadow-sm">
      {/* Institutional Logo Section */}
      <div className="w-64 bg-white flex items-center shrink-0 h-full px-6 border-r border-gray-100">
        <Link href="/" className="flex items-center h-full relative w-full">
          <Image
            src="/mc-logo.png"
            alt="Montgomery College Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>
      </div>

      {/* Nav Links (White Background) */}
      <nav className="flex-1 flex items-stretch bg-white px-2">
        <Link 
          href="/" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            isPathActive("/") ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Home
        </Link>
        <Link 
          href="/clubs" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            isPathActive("/clubs") ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Clubs
        </Link>
        <Link 
          href="/events" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            isPathActive("/events") ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Events
        </Link>
        <Link 
          href="/activity" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            isPathActive("/activity") ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Activity
        </Link>
        <Link 
          href="/profile" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            isPathActive("/profile") ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Profile
        </Link>
        <Link 
          href="/docs" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            isPathActive("/docs") ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Support & Help
        </Link>
      </nav>

      {/* Auth / Right Side */}
      <div className="bg-[#51237f] flex items-center gap-3 px-6 h-full shrink-0">
        {!AUTH_ENABLED ? (
          <div className="text-white font-semibold text-sm">Sign-in unavailable</div>
        ) : userEmail ? (
          <>
            <div className="text-right">
              <Link href="/profile" className="text-white font-semibold text-sm leading-tight hover:underline">
                {displayName || userEmail.split("@")[0]}
              </Link>
              <div className="flex flex-wrap justify-end gap-1.5 pt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
                  <Users size={11} />
                  {joinedClubCount} club{joinedClubCount === 1 ? "" : "s"}
                </span>
                {leadershipCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
                    <ShieldCheck size={11} />
                    {leadershipCount} leadership
                  </span>
                ) : null}
                {isPlatformAdmin ? (
                  <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
                    Admin
                  </span>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={14} />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#51237f] transition hover:bg-gray-100"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
