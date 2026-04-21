"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SessionNavAction } from "@/components/auth/session-nav-action";
import type { WebSessionProfile } from "@/lib/auth-session";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/clubs", label: "Clubs" },
  { href: "/events", label: "Events" },
  { href: "/activity", label: "Activity" },
  { href: "/docs", label: "Support & Help" },
];

export function TopNav({ profile }: { profile: WebSessionProfile | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line-soft)] bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="relative flex h-11 w-52 shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2 sm:w-60"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/mc-logo.png"
            alt="Montgomery College Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] p-1 lg:flex"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2",
                isActive(item.href)
                  ? "bg-white text-gray-950 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.06)]"
                  : "text-gray-600 hover:bg-white/70 hover:text-gray-950",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center lg:flex">
          <SessionNavAction profile={profile} />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <SessionNavAction profile={profile} />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line-soft)] bg-white text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
          >
            <span className="sr-only">{menuOpen ? "Close navigation" : "Open navigation"}</span>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={cn(
          "border-t border-[var(--line-soft)] bg-white px-4 py-3 shadow-sm lg:hidden",
          menuOpen ? "block" : "hidden",
        )}
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-7xl gap-1 sm:px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "rounded-xl px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2",
                isActive(item.href)
                  ? "bg-[#f3eef8] text-[#51237f]"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-950",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
