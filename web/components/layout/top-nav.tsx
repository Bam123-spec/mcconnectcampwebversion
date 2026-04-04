"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();

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
            pathname === "/" ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Home
        </Link>
        <Link 
          href="/clubs" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            pathname === "/clubs" ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Clubs
        </Link>
        <Link 
          href="/events" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            pathname === "/events" ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Events
        </Link>
        <Link 
          href="/activity" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            pathname === "/activity" ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Activity
        </Link>
        <Link 
          href="/docs" 
          className={cn(
            "flex items-center px-6 h-full text-sm font-semibold border-b-2 transition-colors",
            pathname === "/docs" ? "border-[#51237f] text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Support & Help
        </Link>
      </nav>

      {/* Auth / Right Side */}
      <div className="bg-[#51237f] flex items-center px-6 h-full shrink-0">
        <div className="text-white font-semibold text-sm">Public Preview</div>
      </div>
    </header>
  );
}
