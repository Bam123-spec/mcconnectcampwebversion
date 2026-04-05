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
  rsvp_count?: number;
  organizer_name?: string | null;
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
  onToggleRsvp,
}: {
  event: WebEventCardEvent;
  isPast?: boolean;
  isRegistered?: boolean;
  isPending?: boolean;
  hasSession?: boolean;
  authEnabled?: boolean;
  onToggleRsvp?: (eventId: string, isRegistered: boolean) => void | Promise<void>;
}) {
  const eventDate = new Date(event.date);
  const dateString = Number.isNaN(eventDate.getTime())
    ? "Date to be announced"
    : eventDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
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
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
          <Users size={12} className="text-[#51237f]" /> {(event.rsvp_count ?? 0).toLocaleString()}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-gray-900">
          {event.name}
        </h3>

        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Users size={15} className="text-[#51237f]" />
          <span>{(event.rsvp_count ?? 0).toLocaleString()} going</span>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Clock size={16} className="mt-0.5 shrink-0 text-gray-400" />
            <span>
              {dateString} At {(event.time || "TBA").split(" - ")[0]}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
            <span className="line-clamp-2">{event.location}</span>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm font-medium text-gray-600">
            <Users size={14} className="text-gray-400" />
            {event.organizer_name || "Campus Event"}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-gray-600">
              {isPast
                ? "Event closed"
                : !authEnabled
                  ? "RSVP will be available soon"
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
              <span className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500">
                RSVP Soon
              </span>
            ) : onToggleRsvp ? (
              <button
                type="button"
                onClick={() => onToggleRsvp(event.id, isRegistered)}
                disabled={isPending}
                className={`inline-flex items-center rounded-md px-3.5 py-2.5 text-sm font-semibold transition-colors ${
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
                className="inline-flex items-center rounded-md bg-[#51237f] px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45206b]"
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
