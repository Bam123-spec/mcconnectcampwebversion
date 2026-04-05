"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_ENABLED } from "@/lib/features";
import { supabase } from "@/lib/supabase";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled) {
        setUserEmail(user?.email ?? null);
      }
    };

    syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    await fetch("/auth/session", { method: "DELETE" });
    setUserEmail(null);
    router.push("/");
    router.refresh();
    setIsSigningOut(false);
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
      <div className="bg-[#51237f] flex items-center gap-3 px-6 h-full shrink-0">
        {!AUTH_ENABLED ? (
          <div className="text-white font-semibold text-sm">Public Preview</div>
        ) : userEmail ? (
          <>
            <div className="text-right">
              <div className="text-white font-semibold text-sm leading-tight">
                {userEmail.split("@")[0]}
              </div>
              <div className="text-white/70 text-[11px]">Signed in</div>
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
