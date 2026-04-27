"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { WebSessionProfile } from "@/lib/auth-session";

const getDisplayName = (profile: WebSessionProfile) =>
  profile.full_name || profile.email || "Account";

const getInitials = (profile: WebSessionProfile) => {
  const source = getDisplayName(profile);
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "MC";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export function SessionNavAction({ profile }: { profile: WebSessionProfile | null }) {
  const router = useRouter();

  if (!profile) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-none transition-colors hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-white">
          <LogIn size={15} />
        </span>
        <span>Sign In</span>
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
        className="hidden items-center gap-3 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-muted)] px-3 py-2 shadow-[var(--shadow-soft)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 md:flex"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-xs font-semibold text-white">
          {getInitials(profile)}
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-gray-900">{getDisplayName(profile)}</div>
          <div className="text-xs text-gray-500">{profile.role || "Campus account"}</div>
        </div>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-soft)] bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-800 shadow-[var(--shadow-soft)] transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-[var(--shadow-soft-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 sm:px-4"
      >
        <LogOut size={15} />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </div>
  );
}
