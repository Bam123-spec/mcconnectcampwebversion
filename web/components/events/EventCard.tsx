import Image from "next/image";
import { Users } from "lucide-react";
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

const getUrgencyLabel = (value?: string | null, isPast?: boolean) => {
  if (isPast || !value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfEvent = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const dayDiff = Math.round((startOfEvent.getTime() - startOfToday.getTime()) / 86400000);

  if (dayDiff === 0) return "Today";
  if (dayDiff > 0 && dayDiff <= 3) return "Soon";
  return null;
};

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
  const eventBadge = event.organizer_name ? "Club Event" : "Campus";
  const urgencyLabel = getUrgencyLabel(event.date, isPast);
  const attendeeOverflow = Math.max((event.rsvp_count ?? 0) - 2, 0);
  const dateString = Number.isNaN(eventDate.getTime())
    ? "Date to be announced"
    : eventDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-[24px] border bg-white shadow-[0_16px_34px_-26px_rgba(17,24,39,0.24)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_40px_-24px_rgba(17,24,39,0.3)] ${
        isPast ? "border-gray-150 opacity-90" : "border-gray-200"
      }`}
    >
      <div className="relative h-56 w-full bg-gray-100">
        <Image
          src={event.cover_image_url || fallbackCover}
          alt={event.name}
          fill
          className="object-cover transition duration-500 hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f] shadow-sm backdrop-blur-sm">
            {isPast ? "Past Event" : eventBadge}
          </span>
          {urgencyLabel ? (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm backdrop-blur-sm ${
                urgencyLabel === "Today"
                  ? "bg-[#51237f]/92 text-white"
                  : "bg-amber-400/92 text-gray-950"
              }`}
            >
              {urgencyLabel}
            </span>
          ) : null}
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
          <Users aria-hidden="true" size={12} className="text-[#51237f]" /> {(event.rsvp_count ?? 0).toLocaleString()}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-sm font-medium text-white/85">{event.organizer_name || "Montgomery College"}</p>
          <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight text-white">
            {event.name}
          </h3>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Date</p>
            <p className="mt-1 font-semibold text-gray-900">{dateString}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Time</p>
            <p className="mt-1 font-semibold text-gray-900">{(event.time || "TBA").split(" - ")[0]}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Location</p>
            <p className="mt-1 line-clamp-2 font-semibold text-gray-900">{event.location}</p>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3 text-sm font-medium text-gray-600">
          <div className="flex -space-x-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#51237f] text-[10px] font-bold text-white">
              MC
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#7a58a0] text-[10px] font-bold text-white">
              CL
            </span>
            {attendeeOverflow > 0 ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#a58bc2] text-[10px] font-bold text-white">
                +{attendeeOverflow}
              </span>
            ) : null}
          </div>
          <span>{(event.rsvp_count ?? 0).toLocaleString()} going</span>
        </div>

        <div className="mt-auto space-y-4">
          <p className="line-clamp-2 text-sm leading-6 text-gray-600">{event.description}</p>

          <div className="flex items-center gap-2 border-t border-gray-100 pt-4 text-sm font-medium text-gray-600">
            <Users aria-hidden="true" size={14} className="text-gray-400" />
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
              <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-400">
                Closed
              </span>
            ) : !authEnabled ? (
              <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500">
                RSVP Soon
              </span>
            ) : onToggleRsvp ? (
              <button
                type="button"
                onClick={() => onToggleRsvp(event.id, isRegistered)}
                disabled={isPending}
                aria-label={`${isRegistered ? "Cancel RSVP for" : "RSVP for"} ${event.name}`}
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isRegistered
                    ? "border border-[#51237f] text-[#51237f] hover:bg-purple-50"
                    : "bg-[#51237f] text-white shadow-[0_12px_24px_-18px_rgba(81,35,127,0.7)] hover:bg-[#45206b]"
                } ${isPending ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {isPending ? "Updating..." : isRegistered ? "Cancel RSVP" : "RSVP"}
              </button>
            ) : (
              <Link
                href="/login"
                aria-label={`Sign in to RSVP for ${event.name}`}
                className="inline-flex items-center rounded-full bg-[#51237f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(81,35,127,0.7)] transition-colors hover:bg-[#45206b]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
