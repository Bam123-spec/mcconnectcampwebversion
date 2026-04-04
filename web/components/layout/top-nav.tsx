"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { AUTH_ENABLED } from "@/lib/features";

export function TopNav({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasSession, setHasSession] = useState(AUTH_ENABLED ? isAuthenticated : false);

  useEffect(() => {
    if (!AUTH_ENABLED) {
      return;
    }

    let mounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setHasSession(Boolean(session) || isAuthenticated);
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    if (!AUTH_ENABLED) return;
    await supabase.auth.signOut();
    await fetch("/auth/session", {
      method: "DELETE",
    });
    setHasSession(false);
    router.refresh();
    router.push("/");
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
        {!AUTH_ENABLED ? (
          <div className="text-white font-semibold text-sm">Public Preview</div>
        ) : !hasSession ? (
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-white font-semibold text-sm hover:opacity-80 transition-opacity"
          >
            <LogIn size={18} />
            Sign In
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <User size={18} />
              My Profile
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center text-red-200 hover:text-white transition-colors text-xs font-semibold gap-1 ml-4 border-l border-white/20 pl-4 py-1"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
