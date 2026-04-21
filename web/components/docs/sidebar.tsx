"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, FileText, Settings, Shield, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const docsLinks = [
  { href: "/docs/navigating", label: "Navigating the Dashboard", icon: FileText },
  { href: "/docs/events", label: "Event Management", icon: Settings },
  { href: "/docs/messaging", label: "Messaging & Forums", icon: MessageSquare },
  { href: "/docs/privacy", label: "Privacy & Security", icon: Shield },
];

const quickLinks = [
  { href: "/docs#account-access", label: "1. Account Access" },
  { href: "/docs#event-help", label: "2. Event Help" },
  { href: "/docs#report-issue", label: "3. Reporting Issues" },
];

export function DocsSidebar() {
  const [gettingStartedOpen, setGettingStartedOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside className="hidden w-full shrink-0 border-r border-gray-100 py-8 pr-8 md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)] md:w-72 md:overflow-y-auto">
      <nav className="flex flex-col gap-1 pr-2" aria-label="Documentation navigation">
        <div>
          <button 
            onClick={() => setGettingStartedOpen(!gettingStartedOpen)}
            aria-expanded={gettingStartedOpen}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2",
              pathname === "/docs" ? "bg-gray-50 text-[#0a2342]" : "text-gray-700 hover:bg-gray-50",
            )}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} className={pathname === "/docs" ? "text-[#51237f]" : "text-gray-400"}/>
              <span>Support Overview</span>
            </div>
            {gettingStartedOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          </button>
          
          {gettingStartedOpen && (
            <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 pl-7">
              <Link href="/docs" className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">
                Help Center
              </Link>
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {docsLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2",
                  active ? "bg-purple-50 text-[#51237f]" : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <Icon size={16} className={active ? "text-[#51237f]" : "text-gray-400"} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

export function MobileDocsNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 rounded-lg border border-gray-200 bg-white p-3 shadow-sm md:hidden" aria-label="Documentation sections">
      <Link
        href="/docs"
        className={cn(
          "mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2",
          pathname === "/docs" ? "bg-purple-50 text-[#51237f]" : "text-gray-700 hover:bg-gray-50",
        )}
      >
        <BookOpen size={16} />
        Support Overview
      </Link>
      <div className="grid gap-1 sm:grid-cols-2">
        {docsLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2",
                active ? "bg-purple-50 text-[#51237f]" : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
