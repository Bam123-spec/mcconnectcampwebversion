"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, PlusSquare, Search, Settings, User, Users2 } from "lucide-react";
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
  const [hasLeadershipAccess, setHasLeadershipAccess] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setDisplayName(null);
    setHasLeadershipAccess(false);
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
    setIsSigningOut(false);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();
    const href = query ? `/events?q=${encodeURIComponent(query)}` : "/events";
    router.push(href);
  };

  const avatarLabel = useMemo(() => {
    const source = displayName || userEmail || "User";
    const parts = source.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [displayName, userEmail]);

  const primaryAction =
    hasLeadershipAccess && AUTH_ENABLED && userEmail
      ? pathname.startsWith("/manage")
        ? { href: "/manage/events/new", label: "Create Event", icon: PlusSquare }
        : { href: "/manage", label: "Manage", icon: PlusSquare }
      : null;
  const PrimaryActionIcon = primaryAction?.icon;
  const navItemClass = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-all",
      active
        ? "bg-[#f4ecfb] text-[#51237f] shadow-[inset_0_0_0_1px_rgba(81,35,127,0.08)]"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-[#fcfcfd]/96 shadow-[0_1px_0_rgba(17,24,39,0.03)] backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center">
          <Link href="/" className="relative h-9 w-44 shrink-0 transition-opacity hover:opacity-90">
            <Image
              src="/mc-logo.png"
              alt="Montgomery College Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
        </div>

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center lg:flex"
        >
          <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-1.5 py-1 shadow-[0_10px_22px_-22px_rgba(17,24,39,0.28)]">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={navItemClass(pathname === "/")}
          >
            Home
          </Link>
          <Link
            href="/clubs"
            aria-current={pathname === "/clubs" || pathname.startsWith("/clubs/") ? "page" : undefined}
            className={navItemClass(pathname === "/clubs" || pathname.startsWith("/clubs/"))}
          >
            Clubs
          </Link>
          <Link
            href="/events"
            aria-current={pathname === "/events" ? "page" : undefined}
            className={navItemClass(pathname === "/events")}
          >
            Events
          </Link>
          <Link
            href="/activity"
            aria-current={pathname === "/activity" || pathname === "/profile" ? "page" : undefined}
            className={navItemClass(pathname === "/activity" || pathname === "/profile")}
          >
            Activity
          </Link>
          </div>
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
          {!AUTH_ENABLED ? (
            <div className="text-sm font-medium text-gray-500">Preview</div>
          ) : userEmail ? (
            <>
              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  className="hidden h-10 items-center gap-2 rounded-full bg-[#51237f] px-4 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(81,35,127,0.6)] transition hover:bg-[#45206b] md:inline-flex"
                >
                  {PrimaryActionIcon ? <PrimaryActionIcon size={16} /> : null}
                  {primaryAction.label}
                </Link>
              ) : (
                <form
                  role="search"
                  aria-label="Search campus activity"
                  onSubmit={handleSearch}
                  className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 shadow-[0_12px_24px_-24px_rgba(17,24,39,0.28)] md:flex"
                >
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search events or clubs"
                    className="h-10 w-48 border-0 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </form>
              )}

              {!primaryAction ? (
                <Link
                  href={searchValue.trim() ? `/events?q=${encodeURIComponent(searchValue.trim())}` : "/events"}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-[0_12px_24px_-24px_rgba(17,24,39,0.28)] transition hover:border-[#51237f]/25 hover:text-[#51237f] md:hidden"
                  aria-label="Search events"
                >
                  <Search size={17} />
                </Link>
              ) : (
                <Link
                  href={primaryAction.href}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#51237f] text-white shadow-[0_14px_28px_-18px_rgba(81,35,127,0.6)] transition hover:bg-[#45206b] md:hidden"
                  aria-label={primaryAction.label}
                >
                  {PrimaryActionIcon ? <PrimaryActionIcon size={17} /> : null}
                </Link>
              )}

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-2.5 pr-3 shadow-[0_12px_24px_-24px_rgba(17,24,39,0.28)] transition hover:border-[#51237f]/25 hover:shadow-[0_16px_30px_-24px_rgba(17,24,39,0.32)]"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4ecfb] text-xs font-bold uppercase tracking-[0.08em] text-[#51237f]">
                    {avatarLabel}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-semibold leading-none text-gray-900">{displayName || "Profile"}</span>
                    <span className="block text-xs text-gray-500">{hasLeadershipAccess ? "Leader access" : "Student"}</span>
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {isMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+0.75rem)] w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_18px_36px_-24px_rgba(17,24,39,0.32)]"
                  >
                    <Link
                      href="/activity"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <User size={16} className="text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      href="/clubs"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Users2 size={16} className="text-gray-400" />
                      My Clubs
                    </Link>
                    <Link
                      href="/settings"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Settings size={16} className="text-gray-400" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                      role="menuitem"
                    >
                      <LogOut size={16} className="text-gray-400" />
                      {isSigningOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(81,35,127,0.6)] transition hover:bg-[#45206b]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-gray-100 bg-white px-4 py-2.5 lg:hidden">
        <Link 
          href="/" 
          className={navItemClass(pathname === "/")}
        >
          Home
        </Link>
        <Link 
          href="/clubs" 
          className={navItemClass(pathname === "/clubs" || pathname.startsWith("/clubs/"))}
        >
          Clubs
        </Link>
        <Link
          href="/events"
          className={navItemClass(pathname === "/events")}
        >
          Events
        </Link>
        <Link
          href="/activity"
          className={navItemClass(pathname === "/activity" || pathname === "/profile")}
        >
          Activity
        </Link>
        {!userEmail && (
          <Link
            href="/login"
            className={cn(
              "text-sm font-semibold transition-colors",
              pathname === "/login" ? "text-[#51237f]" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
