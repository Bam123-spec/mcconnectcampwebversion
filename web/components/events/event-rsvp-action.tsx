"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type EventRsvpActionProps = {
  eventId: string;
  hasSession: boolean;
  isRegistered: boolean;
  variant?: "primary" | "compact";
  onChange?: (payload: { eventId: string; isRegistered: boolean; registrationsCount: number }) => void;
};

export function EventRsvpAction({
  eventId,
  hasSession,
  isRegistered,
  variant = "primary",
  onChange,
}: EventRsvpActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!hasSession) {
    return (
      <Link
        href="/login"
        className={
          variant === "compact"
            ? "inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3C0957] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            : "inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3C0957] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        }
      >
        Log in to RSVP
      </Link>
    );
  }

  const submit = () => {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: isRegistered ? "DELETE" : "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; isRegistered?: boolean; registrationsCount?: number }
        | null;

      if (!response.ok) {
        setError(payload?.error || "Could not update RSVP.");
        return;
      }

      const nextState = {
        eventId,
        isRegistered: Boolean(payload?.isRegistered),
        registrationsCount: payload?.registrationsCount ?? 0,
      };

      onChange?.(nextState);
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className={
          variant === "compact"
            ? `inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                isRegistered
                  ? "border border-[var(--primary)] bg-white text-[var(--primary)] hover:bg-[rgba(71,10,104,0.08)]"
                  : "bg-[var(--primary)] text-white hover:bg-[#3C0957]"
              }`
            : `inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                isRegistered
                  ? "border border-[var(--primary)] bg-white text-[var(--primary)] hover:bg-[rgba(71,10,104,0.08)]"
                  : "bg-[var(--primary)] text-white hover:bg-[#3C0957]"
              }`
        }
      >
        {isPending ? "Updating..." : isRegistered ? "Cancel RSVP" : "RSVP"}
      </button>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
