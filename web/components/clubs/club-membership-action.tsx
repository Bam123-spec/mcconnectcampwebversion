"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ClubViewerState } from "@/lib/clubs";

type ClubMembershipActionProps = {
  clubId: string;
  viewerState: ClubViewerState;
};

export function ClubMembershipAction({ clubId, viewerState }: ClubMembershipActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!viewerState.isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
      >
        Log in to join
      </Link>
    );
  }

  const isJoined = viewerState.membershipStatus === "approved";
  const isWaiting = viewerState.membershipStatus === "pending";

  const submit = () => {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/clubs/${clubId}/membership`, {
        method: isJoined ? "DELETE" : "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || "Could not update membership.");
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={submit}
        disabled={isPending || isWaiting}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 sm:w-auto"
      >
        {isPending
          ? "Updating..."
          : isWaiting
            ? "Request pending"
            : isJoined
              ? "Leave club"
              : "Join club"}
      </button>
      {error ? <p className="max-w-sm text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
