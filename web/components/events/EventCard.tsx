import { Users } from "lucide-react";
import Link from "next/link";
import { EventPassButton } from "@/components/events/event-pass-button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

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
  const eventTimeLabel = (event.time || "TBA").split(" - ")[0];

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-[10px] border bg-white shadow-[0_12px_28px_-28px_rgba(17,24,39,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-28px_rgba(17,24,39,0.22)] ${
        isPast ? "border-gray-150 opacity-90" : "border-gray-200"
      }`}
    >
      <div className="relative h-40 w-full bg-gray-100">
        <ImageWithFallback
          src={event.cover_image_url}
          fallbackSrc={fallbackCover}
          alt={event.name}
          fill
          className="object-cover object-center"
          style={{ objectPosition: "center 32%" }}
        />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/94 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f] shadow-sm">
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
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/94 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
          <Users aria-hidden="true" size={12} className="text-[#51237f]" /> {(event.rsvp_count ?? 0).toLocaleString()}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-3.5">
          <div>
            <p className="text-sm font-medium text-gray-500">{event.organizer_name || "Campus Event"}</p>
            <h3 className="mt-2 line-clamp-2 text-[1.45rem] font-bold leading-tight text-gray-950">
              <Link href={`/events/${event.id}`} className="transition hover:text-[#51237f] focus:outline-none focus:text-[#51237f]">
                {event.name}
              </Link>
            </h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{dateString}</span>
              <span className="text-gray-300">•</span>
              <span>{eventTimeLabel}</span>
            </div>
            <div className="line-clamp-1 text-gray-500">{event.location}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-gray-600">{event.description}</p>
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
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
              <span className="font-medium">{(event.rsvp_count ?? 0).toLocaleString()} going</span>
            </div>
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
          </div>
          <div className="flex items-center justify-end gap-3">
            {isPast ? (
              <span className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-400">
                Closed
              </span>
            ) : !authEnabled ? (
              <span className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500">
                RSVP Soon
              </span>
            ) : isRegistered ? (
              <EventPassButton
                eventId={event.id}
                eventName={event.name}
                eventDate={dateString}
                eventTime={eventTimeLabel}
                eventLocation={event.location}
              />
            ) : onToggleRsvp ? (
              <button
                type="button"
                onClick={() => onToggleRsvp(event.id, isRegistered)}
                disabled={isPending}
                aria-label={`${isRegistered ? "Cancel RSVP for" : "RSVP for"} ${event.name}`}
                className={`inline-flex items-center rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
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
                className="inline-flex items-center rounded-md bg-[#51237f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(81,35,127,0.7)] transition-colors hover:bg-[#45206b]"
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
