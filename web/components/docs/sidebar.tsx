"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, FileText, Settings, Shield, BookOpen, MessageSquare } from "lucide-react";

export function DocsSidebar() {
  const [gettingStartedOpen, setGettingStartedOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-72 shrink-0 py-8 pr-8 border-r border-gray-100 hidden md:block sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
      <nav className="flex flex-col gap-1 pr-2">
        
        {/* Dropdown Area: Getting Started */}
        <div>
          <div
            className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
              pathname === "/docs" ? "bg-gray-50 text-[#0a2342]" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Link href="/docs" className="flex min-w-0 items-center gap-2">
              <BookOpen size={16} className={pathname === "/docs" ? "text-[#51237f]" : "text-gray-400"} />
              <span>Getting Started</span>
            </Link>
            <button
              type="button"
              aria-expanded={gettingStartedOpen}
              aria-controls="docs-getting-started-links"
              aria-label={gettingStartedOpen ? "Collapse getting started links" : "Expand getting started links"}
              onClick={() => setGettingStartedOpen(!gettingStartedOpen)}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
            >
              {gettingStartedOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
            </button>
          </div>
          
          {gettingStartedOpen && (
            <div id="docs-getting-started-links" className="flex flex-col gap-1 mt-1 pl-7 border-l-2 border-gray-100 ml-4">
              <Link href="/docs#completing-your-profile" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                1. Completing Your Profile
              </Link>
              <Link href="/docs#finding-groups" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                2. Finding and Joining Groups
              </Link>
              <Link href="/docs#managing-rsvps" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                3. Managing Event RSVPs
              </Link>
            </div>
          )}
        </div>

        {/* Other Doc Links */}
        <div className="mt-4 flex flex-col gap-1">
          <Link 
            href="/docs/navigating" 
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              pathname === '/docs/navigating' ? 'text-[#51237f] bg-purple-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} className={pathname === '/docs/navigating' ? "text-[#51237f]" : "text-gray-400"} />
            Navigating the Dashboard
          </Link>
          <Link 
            href="/docs/events" 
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              pathname === '/docs/events' ? 'text-[#51237f] bg-purple-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={16} className={pathname === '/docs/events' ? "text-[#51237f]" : "text-gray-400"} />
            Event Management
          </Link>
          <Link 
            href="/docs/messaging" 
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              pathname === '/docs/messaging' ? 'text-[#51237f] bg-purple-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare size={16} className={pathname === '/docs/messaging' ? "text-[#51237f]" : "text-gray-400"} />
            Messaging & Forums
          </Link>
          <Link 
            href="/docs/privacy" 
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              pathname === '/docs/privacy' ? 'text-[#51237f] bg-purple-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Shield size={16} className={pathname === '/docs/privacy' ? "text-[#51237f]" : "text-gray-400"} />
            Privacy & Security
          </Link>
        </div>
        
      </nav>
    </aside>
  );
}
