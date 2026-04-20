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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-stretch">
        <div className="flex h-full w-52 shrink-0 items-center border-r border-gray-100 bg-white px-4 sm:w-64 sm:px-6">
          <Link href="/" className="relative flex h-11 w-full items-center" onClick={() => setMenuOpen(false)}>
            <Image
              src="/mc-logo.png"
              alt="Montgomery College Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
        </div>

        <nav className="hidden flex-1 items-stretch bg-white px-2 lg:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-full items-center border-b-2 px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2",
                isActive(item.href)
                  ? "border-[#51237f] text-gray-950"
                  : "border-transparent text-gray-600 hover:text-gray-950",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden h-full shrink-0 items-center bg-white px-5 lg:flex">
          <SessionNavAction profile={profile} />
        </div>

        <div className="ml-auto flex items-center gap-2 px-3 lg:hidden">
          <SessionNavAction profile={profile} />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
          >
            <span className="sr-only">{menuOpen ? "Close navigation" : "Open navigation"}</span>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={cn(
          "border-t border-gray-100 bg-white px-4 py-3 shadow-sm lg:hidden",
          menuOpen ? "block" : "hidden",
        )}
        aria-label="Mobile navigation"
      >
        <div className="grid gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "rounded-lg px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2",
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
