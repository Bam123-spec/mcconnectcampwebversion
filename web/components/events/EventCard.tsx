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
}: {
  event: WebEventCardEvent;
  isPast?: boolean;
  isRegistered?: boolean;
  isPending?: boolean;
  hasSession?: boolean;
  authEnabled?: boolean;
  detailsHref?: string;
  onToggleRsvp?: (eventId: string, isRegistered: boolean) => void | Promise<void>;
}) {
  // Format dates similarly to "Fri, Apr 3, 2026 At 5:30 PM"
  const parsedDate = parseLocalDate(event.date);
  const dateString = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : event.day || "Date TBA";

  return (
    <div
      className={`group ui-surface ui-surface-hover flex h-full flex-col overflow-hidden ${
        isPast ? "opacity-90" : ""
      }`}
    >
      <Link href={detailsHref ?? `/events/${event.id}`} className="relative block h-52 w-full bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">
        <Image
          src={event.cover_image_url || fallbackCover}
          alt={event.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
        />
        <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-700 shadow-sm">
          {isPast ? "Past" : "Campus"}
        </div>
        {typeof event.audience_count === "number" ? (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/70 bg-white/92 px-3 py-1 text-[11px] font-semibold text-gray-700 shadow-sm">
            <Users size={12} /> {event.audience_count}
          </div>
        ) : null}
      </Link>
      
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#51237f]">
          {isPast ? "Past event" : "Campus event"}
        </div>
        <Link href={detailsHref ?? `/events/${event.id}`} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">
          <h3 className="mb-3 line-clamp-2 text-xl font-semibold leading-tight text-gray-950 transition-colors group-hover:text-[#421d68]">
            {event.name}
          </h3>
        </Link>
        
        <div className="mt-auto space-y-2.5">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <span>
              {dateString} At {(event.time || "TBA").split(" - ")[0]}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.location}</span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <span className="text-xs font-medium text-gray-500">
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
                className="inline-flex items-center rounded-lg bg-[#51237f] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#45206b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
              >
                View details
              </Link>
            ) : onToggleRsvp ? (
              <button
                type="button"
                onClick={() => onToggleRsvp(event.id, isRegistered)}
                disabled={isPending}
                className={`inline-flex items-center rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  isRegistered
                    ? "border border-[#51237f] text-[#51237f] hover:bg-purple-50"
                    : "bg-[#51237f] text-white hover:bg-[#45206b]"
                } ${isPending ? "cursor-not-allowed opacity-60" : ""} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2`}
              >
                {isPending ? "Updating..." : isRegistered ? "Cancel RSVP" : "RSVP"}
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg bg-[#51237f] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#45206b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
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
