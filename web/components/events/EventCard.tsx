import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Users } from "lucide-react";

export type WebEventCardEvent = {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  cover_image_url?: string | null;
  audience_count?: number;
  day?: string | null;
};

const fallbackCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export function EventCard({
  event,
  isPast = false,
  isRegistered = false,
  isPending = false,
  hasSession = false,
  authEnabled = true,
  detailsHref,
  onToggleRsvp,
  variant = "default",
}: {
  event: WebEventCardEvent;
  isPast?: boolean;
  isRegistered?: boolean;
  isPending?: boolean;
  hasSession?: boolean;
  authEnabled?: boolean;
  detailsHref?: string;
  onToggleRsvp?: (eventId: string, isRegistered: boolean) => void | Promise<void>;
  variant?: "default" | "compact";
}) {
  // Format dates similarly to "Fri, Apr 3, 2026 At 5:30 PM"
  const parsedDate = parseLocalDate(event.date);
  const dateParts = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? {
        month: parsedDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: parsedDate.toLocaleDateString("en-US", { day: "2-digit" }),
        weekday: parsedDate.toLocaleDateString("en-US", { weekday: "short" }),
      }
    : {
        month: "TBA",
        day: "--",
        weekday: "Date",
      };
  const dateString = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : event.day || "Date TBA";

  const compact = variant === "compact";

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-[20px] border border-[var(--line-soft)] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)] ${
        isPast ? "opacity-90" : ""
      }`}
    >
      <Link
        href={detailsHref ?? `/events/${event.id}`}
        className={`relative block w-full bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
          compact ? "aspect-[16/9]" : "aspect-[16/10]"
        }`}
      >
        <Image
          src={event.cover_image_url || fallbackCover}
          alt={event.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-700 shadow-sm">
          {isPast ? "Past" : "Campus"}
        </div>
        {typeof event.audience_count === "number" ? (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-gray-700 shadow-sm">
            <Users size={12} /> {event.audience_count}
          </div>
        ) : null}
        <div className="absolute bottom-4 left-4 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-center shadow-sm backdrop-blur">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            {dateParts.weekday}
          </div>
          <div className="mt-1 text-lg font-semibold leading-none text-gray-950">{dateParts.day}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            {dateParts.month}
          </div>
        </div>
      </Link>
      
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <div className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 ${compact ? "text-[10px]" : ""}`}>
          {isPast ? "Past event" : "Campus event"}
        </div>
        <Link
          href={detailsHref ?? `/events/${event.id}`}
          className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          <h3 className={`mb-3 line-clamp-2 font-semibold leading-tight text-gray-950 transition-colors group-hover:text-[var(--primary)] ${compact ? "text-base" : "text-lg"}`}>
            {event.name}
          </h3>
        </Link>
        
        <div className={`mt-auto ${compact ? "space-y-2" : "space-y-2.5"}`}>
          <div className={`flex items-start gap-2 text-gray-600 ${compact ? "text-xs" : "text-sm"}`}>
            <Clock size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <span>
              {dateString} At {(event.time || "TBA").split(" - ")[0]}
            </span>
          </div>
          <div className={`flex items-start gap-2 text-gray-600 ${compact ? "text-xs" : "text-sm"}`}>
            <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.location}</span>
          </div>

          <div className={`mt-5 flex items-center justify-between gap-3 border-t border-[var(--line-soft)] ${compact ? "pt-3" : "pt-4"}`}>
            <span className={`font-medium text-gray-500 ${compact ? "text-[11px]" : "text-xs"}`}>
              {isPast
                ? "Event closed"
                : !authEnabled
                  ? "Open the details page"
                : isRegistered
                  ? "You are registered"
                  : hasSession
                    ? "Reserve your spot"
                    : "Sign in to RSVP"}
            </span>

            {isPast ? (
              <span className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-400">
                Closed
              </span>
            ) : !authEnabled ? (
              <Link
                href={detailsHref ?? `/events/${event.id}`}
                className={`inline-flex items-center rounded-lg bg-[var(--primary)] font-semibold text-white transition-colors hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                  compact ? "px-3 py-1.5 text-[11px]" : "px-3.5 py-2 text-xs"
                }`}
              >
                View details
              </Link>
            ) : onToggleRsvp ? (
              <button
                type="button"
                onClick={() => onToggleRsvp(event.id, isRegistered)}
                disabled={isPending}
                className={`inline-flex items-center rounded-lg font-semibold transition-colors ${
                  compact ? "px-3 py-1.5 text-[11px]" : "px-3.5 py-2 text-xs"
                } ${
                  isRegistered
                    ? "border border-[var(--primary)] text-[var(--primary)] hover:bg-[rgba(71,10,104,0.08)]"
                    : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]"
                } ${isPending ? "cursor-not-allowed opacity-60" : ""} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2`}
              >
                {isPending ? "Updating..." : isRegistered ? "Cancel RSVP" : "RSVP"}
              </button>
            ) : (
              <Link
                href="/login"
                className={`inline-flex items-center rounded-lg bg-[var(--primary)] font-semibold text-white transition-colors hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                  compact ? "px-3 py-1.5 text-[11px]" : "px-3.5 py-2 text-xs"
                }`}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
