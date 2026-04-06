"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_ENABLED } from "@/lib/features";
import { supabase } from "@/lib/supabase";

type ProfileRow = {
  full_name?: string | null;
};

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
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
        }
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

      if (!cancelled) {
        const profileRow = profile as ProfileRow | null;
        setUserEmail(user.email ?? null);
        setDisplayName(profileRow?.full_name || user.email?.split("@")[0] || null);
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
    router.push("/");
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-6 px-4 md:px-6 lg:px-8">
        <Link href="/" className="relative h-10 w-48 shrink-0">
          <Image
            src="/mc-logo.png"
            alt="Montgomery College Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(
              "text-sm font-semibold transition-colors",
              pathname === "/" ? "text-[#51237f]" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Explore
          </Link>
          <Link
            href="/clubs"
            aria-current={pathname === "/clubs" || pathname.startsWith("/clubs/") ? "page" : undefined}
            className={cn(
              "text-sm font-semibold transition-colors",
              pathname === "/clubs" || pathname.startsWith("/clubs/") ? "text-[#51237f]" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Clubs
          </Link>
          <Link
            href="/events"
            aria-current={pathname === "/events" ? "page" : undefined}
            className={cn(
              "text-sm font-semibold transition-colors",
              pathname === "/events" ? "text-[#51237f]" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Events
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!AUTH_ENABLED ? (
            <div className="text-sm font-medium text-gray-500">Preview</div>
          ) : userEmail ? (
            <>
              <Link
                href="/profile"
                className="hidden text-sm font-semibold text-gray-800 transition-colors hover:text-[#51237f] sm:inline-flex"
              >
                {displayName || "Profile"}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={14} />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 border-t border-gray-100 px-4 py-3 md:hidden">
        <Link 
          href="/" 
          className={cn(
            "text-sm font-semibold transition-colors",
            pathname === "/" ? "text-[#51237f]" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Explore
        </Link>
        <Link 
          href="/clubs" 
          className={cn(
            "text-sm font-semibold transition-colors",
            pathname === "/clubs" || pathname.startsWith("/clubs/") ? "text-[#51237f]" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Clubs
        </Link>
        <Link
          href="/events"
          className={cn(
            "text-sm font-semibold transition-colors",
            pathname === "/events" ? "text-[#51237f]" : "text-gray-600 hover:text-gray-900"
          )}
        >
          Events
        </Link>
        <Link
          href={userEmail ? "/profile" : "/login"}
          className={cn(
            "text-sm font-semibold transition-colors",
            pathname === "/profile" || pathname === "/login" ? "text-[#51237f]" : "text-gray-600 hover:text-gray-900"
          )}
        >
          {userEmail ? "Profile" : "Sign In"}
        </Link>
      </div>
    </header>
  );
}
