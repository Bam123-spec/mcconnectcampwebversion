import Image from "next/image";
import { MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";

export type WebEventCardEvent = {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  cover_image_url?: string | null;
  audience_count?: number;
};

const fallbackCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";

export function EventCard({
  event,
  isPast = false,
  isRegistered = false,
  isPending = false,
  hasSession = false,
  onToggleRsvp,
}: {
  event: WebEventCardEvent;
  isPast?: boolean;
  isRegistered?: boolean;
  isPending?: boolean;
  hasSession?: boolean;
  onToggleRsvp?: (eventId: string, isRegistered: boolean) => void | Promise<void>;
}) {
  // Format dates similarly to "Fri, Apr 3, 2026 At 5:30 PM"
  const eventDate = new Date(event.date);
  const dateString = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white flex flex-col h-full shadow-sm ${
        isPast ? "border-gray-150 opacity-90" : "border-gray-200"
      }`}
    >
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={event.cover_image_url || fallbackCover}
          alt={event.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 left-2 bg-gray-800/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm">
          {isPast ? "Past" : "Campus"}
        </div>
        <div className="absolute top-2 right-2 bg-gray-800/60 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Users size={12} /> {event.audience_count ?? 10}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[#51237f] text-lg mb-4 line-clamp-2 leading-tight">
          {event.name}
        </h3>
        
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
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-500">
            <Users size={14} className="text-gray-400" />
            Student Life Office
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-gray-500">
              {isPast
                ? "Event closed"
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
