"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { WebSessionProfile } from "@/lib/auth-session";

const getDisplayName = (profile: WebSessionProfile) =>
  profile.full_name || profile.email || "Account";

export function SessionNavAction({ profile }: { profile: WebSessionProfile | null }) {
  const router = useRouter();

  if (!profile) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2 sm:px-4"
      >
        <LogIn size={15} />
        <span className="hidden sm:inline">Log in</span>
      </Link>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await fetch("/auth/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/activity"
        className="hidden rounded-md leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2 sm:block"
      >
        <div className="text-sm font-semibold text-gray-900">{getDisplayName(profile)}</div>
        <div className="text-xs text-gray-500">{profile.role || "Campus account"}</div>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2 sm:px-4"
      >
        <LogOut size={15} />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </div>
  );
}
