"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogIn, User } from "lucide-react";
import { AUTH_ENABLED } from "@/lib/features";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type ProfileRow = {
  full_name?: string | null;
  role?: string | null;
};

const navItems = [
  { href: "/", label: "Home", match: (pathname: string) => pathname === "/" },
  { href: "/clubs", label: "Clubs", match: (pathname: string) => pathname === "/clubs" || pathname.startsWith("/clubs/") },
  { href: "/events", label: "Events", match: (pathname: string) => pathname === "/events" || pathname.startsWith("/events/") },
  { href: "/activity", label: "Activity", match: (pathname: string) => pathname === "/activity" || pathname === "/profile" },
];

export function TopNav() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [hasLeadershipAccess, setHasLeadershipAccess] = useState(false);

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
          setHasLeadershipAccess(false);
        }
        return;
      }

      const [{ data: profile }, { data: officerRoles }] = await Promise.all([
        supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle(),
        supabase.from("officers").select("id").eq("user_id", user.id).limit(1),
      ]);

      if (!cancelled) {
        const profileRow = profile as ProfileRow | null;
        setUserEmail(user.email ?? null);
        setDisplayName(profileRow?.full_name || user.email?.split("@")[0] || null);
        setHasLeadershipAccess(Boolean(officerRoles?.length) || profileRow?.role === "admin");
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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[64px] max-w-6xl items-stretch px-4 md:px-6 lg:px-8">
        <Link href="/" className="relative mr-8 flex w-48 shrink-0 items-center">
          <Image
            src="/mc-logo.png"
            alt="Montgomery College Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-stretch md:flex">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-24 items-center justify-center px-5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-[#51237f] text-white"
                    : "border-x border-transparent text-gray-700 hover:bg-gray-50 hover:text-[#51237f]"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {hasLeadershipAccess ? (
            <Link
              href="/manage"
              aria-current={pathname === "/manage" || pathname.startsWith("/manage/") ? "page" : undefined}
              className={cn(
                "flex min-w-24 items-center justify-center px-5 text-sm font-semibold transition-colors",
                pathname === "/manage" || pathname.startsWith("/manage/")
                  ? "bg-[#51237f] text-white"
                  : "border-x border-transparent text-gray-700 hover:bg-gray-50 hover:text-[#51237f]"
              )}
            >
              Manage
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!AUTH_ENABLED ? (
            <span className="text-sm font-semibold text-gray-500">Preview</span>
          ) : userEmail ? (
            <Link
              href="/activity"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 hover:text-[#51237f]"
            >
              <User size={16} />
              <span className="hidden sm:inline">{displayName || "Account"}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 hover:text-[#51237f]"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </div>
      </div>

      <nav aria-label="Mobile primary" className="flex border-t border-gray-100 bg-white md:hidden">
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 items-center justify-center px-2 py-3 text-sm font-semibold transition-colors",
                active ? "bg-[#51237f] text-white" : "text-gray-700 hover:bg-gray-50 hover:text-[#51237f]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
