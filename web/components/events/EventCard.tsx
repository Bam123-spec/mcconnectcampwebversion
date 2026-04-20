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
  const parsedDate = event.date ? new Date(event.date) : null;
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
      className={`group overflow-hidden rounded-lg border bg-white flex flex-col h-full shadow-sm ${
        isPast ? "border-gray-150 opacity-90" : "border-gray-200"
      }`}
    >
      <Link href={detailsHref ?? `/events/${event.id}`} className="relative h-48 w-full bg-gray-100 block">
        <Image
          src={event.cover_image_url || fallbackCover}
          alt={event.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 left-2 bg-gray-800/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
          {isPast ? "Past" : "Campus"}
        </div>
        {typeof event.audience_count === "number" ? (
          <div className="absolute top-2 right-2 bg-gray-800/60 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Users size={12} /> {event.audience_count}
          </div>
        ) : null}
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <Link href={detailsHref ?? `/events/${event.id}`} className="block">
          <h3 className="font-bold text-[#51237f] text-lg mb-3 line-clamp-2 leading-tight group-hover:text-[#421d68] transition-colors">
            {event.name}
          </h3>
        </Link>
        
        <div className="mt-auto space-y-2">
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

          <div className="mt-4 flex items-center justify-between gap-3">
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
                className="inline-flex items-center rounded-md bg-[#51237f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#45206b] transition-colors"
              >
                View details
              </Link>
            ) : onToggleRsvp ? (
              <button
                type="button"
                onClick={() => onToggleRsvp(event.id, isRegistered)}
                disabled={isPending}
                className={`inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                  isRegistered
                    ? "border border-[#51237f] text-[#51237f] hover:bg-purple-50"
                    : "bg-[#51237f] text-white hover:bg-[#45206b]"
                } ${isPending ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {isPending ? "Updating..." : isRegistered ? "Cancel RSVP" : "RSVP"}
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-md bg-[#51237f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#45206b] transition-colors"
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
