import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, FileText, MapPin, Ticket, Users } from "lucide-react";
import { EventRsvpAction } from "@/components/events/event-rsvp-action";
import { slugifyClubName } from "@/lib/club-utils";
import type { EventDetail } from "@/lib/events";

type EventDetailPanelProps = {
  event: EventDetail;
};

const fallbackCover =
  "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1800&auto=format&fit=crop";

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const parseEventDate = (event: EventDetail) => {
  const directDate = parseLocalDate(event.date || undefined);
  if (directDate) return directDate;

  if (!event.day) return null;

  const guessed = new Date(`${new Date().getFullYear()} ${event.day}`);
  return Number.isNaN(guessed.getTime()) ? null : guessed;
};

const formatLongDate = (event: EventDetail) => {
  const parsed = parseEventDate(event);

  if (parsed) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  }

  return event.day || "Date to be announced";
};

const getDateBadge = (event: EventDetail) => {
  const parsed = parseEventDate(event);

  if (!parsed) {
    return {
      month: "TBA",
      day: "--",
    };
  }

  return {
    month: parsed.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: parsed.toLocaleDateString("en-US", { day: "numeric" }),
  };
};

const isPrivateLocation = (value: string) =>
  /private location|sign in to display|not public/i.test(value);

const parseTimePart = (value: string) => {
  const normalized = value
    .replace(/[.]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridiem = match[3];

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
};

const toCalendarStamp = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}00`;
};

const buildCalendarUrl = (event: EventDetail) => {
  const parsedDate = parseEventDate(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    details: event.description,
    location: event.location,
  });

  if (parsedDate) {
    const [startPart, endPart] = event.time
      .split(/[–-]/)
      .map((part) => part.trim())
      .filter(Boolean);

    const startTime = parseTimePart(startPart || "");
    const endTime = parseTimePart(endPart || "");

    if (startTime) {
      const start = new Date(parsedDate);
      start.setHours(startTime.hours, startTime.minutes, 0, 0);

      const end = new Date(start);
      if (endTime) {
        end.setHours(endTime.hours, endTime.minutes, 0, 0);
      } else {
        end.setHours(start.getHours() + 1, start.getMinutes(), 0, 0);
      }

      params.set("dates", `${toCalendarStamp(start)}/${toCalendarStamp(end)}`);
    }
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildMapUrl = (location: string) => {
  if (isPrivateLocation(location)) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
};

const splitParagraphs = (value: string) =>
  value
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

export function EventDetailPanel({ event }: EventDetailPanelProps) {
  const dateBadge = getDateBadge(event);
  const calendarUrl = buildCalendarUrl(event);
  const mapUrl = buildMapUrl(event.location);
  const hostSlug = event.clubName ? slugifyClubName(event.clubName) : null;
  const hostHref = hostSlug ? `/clubs/${hostSlug}` : "/clubs";
  const detailsParagraphs = splitParagraphs(event.description);
  const registrationCount = event.registrationsCount || event.audience_count || 0;
  const hostLabel = event.clubName || "Campus office";

  return (
    <main className="min-h-screen bg-[var(--page-background)]">
      <div className="border-b border-[var(--line-soft)] bg-white/90">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden border border-[var(--line-soft)] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
            <div className="relative min-h-[340px] bg-gray-100 lg:min-h-[560px]">
              <Image
                src={event.cover_image_url || fallbackCover}
                alt={event.name}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 65vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/20" />

              <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                <span className="rounded-sm border border-white/90 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-800 shadow-sm">
                  {event.clubName ? "Club event" : "Campus event"}
                </span>
                {event.isFree ? (
                  <span className="rounded-sm border border-white/90 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--primary)] shadow-sm">
                    Free
                  </span>
                ) : null}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
                <div className="max-w-3xl">
                  <div className="inline-flex rounded-sm border border-white/85 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--primary)] shadow-sm">
                    {hostLabel}
                  </div>
                  <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {event.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/95">
                    <span>{formatLongDate(event)}</span>
                    <span className="h-1 w-1 rounded-full bg-white/70" />
                    <span>{event.time || "Time to be announced"}</span>
                    <span className="h-1 w-1 rounded-full bg-white/70" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--line-soft)] p-6 lg:border-l lg:border-t-0 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                    {dateBadge.month}
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
                    {dateBadge.day}
                  </div>
                </div>
                <div className="text-right text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
                  {event.isFree ? "Free" : "RSVP"}
                </div>
              </div>

              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-gray-950 sm:text-[2rem]">
                {event.name}
              </h2>
              <p className="mt-3 text-base font-medium leading-7 text-gray-700">
                by{" "}
                {event.clubName ? (
                  <Link
                    href={hostHref}
                    className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                  >
                    {event.clubName}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-950">{hostLabel}</span>
                )}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-sm border border-[var(--line-soft)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700">
                  {event.isFree ? "Free registration" : "Registration required"}
                </span>
                <span className="rounded-sm border border-[var(--line-soft)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700">
                  {event.club_id ? "Club hosted" : "Campus hosted"}
                </span>
              </div>

              <div className="mt-7 border-t border-[var(--line-soft)] pt-6">
                <div className="grid gap-5 text-sm font-medium text-gray-700">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                    <div>
                      <div className="font-semibold text-gray-950">{formatLongDate(event)}</div>
                      <div className="mt-1 text-gray-600">Event date</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                    <div>
                      <div className="font-semibold text-gray-950">{event.time || "Time to be announced"}</div>
                      <div className="mt-1 text-gray-600">Start and end time</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                    <div>
                      <div className="font-semibold text-gray-950">{event.location}</div>
                      <div className="mt-1 text-gray-600">
                        {mapUrl ? "Open in maps" : "Private location"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[var(--line-soft)] px-5 py-5 sm:grid-cols-3 lg:px-7">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                Date and time
              </div>
              <div className="text-sm font-semibold text-gray-950">{formatLongDate(event)}</div>
              <div className="text-sm font-medium text-gray-700">{event.time || "Time to be announced"}</div>
              <a
                href={calendarUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Add to calendar
              </a>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                Location
              </div>
              <div className="text-sm font-semibold text-gray-950">{event.location}</div>
              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  View map
                </a>
              ) : (
                <div className="mt-1 text-sm font-medium text-gray-600">Sign in to see private location details</div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                Registered
              </div>
              <div className="text-3xl font-semibold tracking-tight text-gray-950">{registrationCount}</div>
              <div className="text-sm font-medium text-gray-700">
                {registrationCount === 1 ? "student is registered" : "students are registered"}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 border border-[var(--line-soft)] bg-white p-6 lg:p-7">
          <div className="flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--primary)]">
            <Ticket className="h-4 w-4" />
            Registration
          </div>

          <div className="mt-5 overflow-hidden border border-[var(--line-soft)] bg-white">
            <div className="grid grid-cols-1 gap-4 border-b border-[var(--line-soft)] bg-[var(--surface-muted)]/70 px-4 py-3 text-sm font-semibold tracking-normal text-gray-700 sm:grid-cols-5 sm:px-5">
              <div>Options</div>
              <div>Sales Start</div>
              <div>Sales End</div>
              <div>Availability</div>
              <div>Price</div>
            </div>

            <div className="grid grid-cols-1 gap-4 px-4 py-4 text-sm font-medium text-gray-700 sm:grid-cols-5 sm:px-5">
              <div className="font-semibold text-gray-950">RSVP</div>
              <div>-</div>
              <div>-</div>
              <div>Unlimited</div>
              <div className="font-semibold text-gray-950">{event.isFree ? "FREE" : "Included"}</div>
            </div>

            <div className="flex justify-end border-t border-[var(--line-soft)] px-4 py-4 sm:px-5">
              <EventRsvpAction
                eventId={event.id}
                hasSession={event.hasSession}
                isRegistered={event.isRegistered}
              />
            </div>
          </div>
        </section>

        <section className="mt-8 border border-[var(--line-soft)] bg-white p-6 lg:p-7">
          <div className="flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--primary)]">
            <FileText className="h-4 w-4" />
            Details
          </div>

          <div className="mt-5 space-y-4 text-[15px] font-medium leading-8 text-gray-800 sm:text-base">
            {detailsParagraphs.length > 0 ? (
              detailsParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)
            ) : (
              <p>This event will share more details soon.</p>
            )}
          </div>

          <div className="mt-6 border-t border-[var(--line-soft)] pt-5">
            <div className="text-sm font-semibold text-gray-950">
              {event.day ? `Occurs ${event.day} during the semester.` : "Schedule information will be posted when available."}
            </div>
            <div className="mt-2 text-sm font-medium leading-7 text-gray-700">
              Use the calendar and map links above to move quickly to the details that matter.
            </div>
          </div>
        </section>

        <section className="mt-8 border border-[var(--line-soft)] bg-white p-6 lg:p-7">
          <div className="flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--primary)]">
            <Users className="h-4 w-4" />
            Hosted by
          </div>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-950">{hostLabel}</h2>
              {event.clubDescription ? (
                <p className="mt-3 text-base font-medium leading-7 text-gray-700">
                  {event.clubDescription}
                </p>
              ) : (
                <p className="mt-3 text-base font-medium leading-7 text-gray-700">
                  This event is hosted by Montgomery College and the event page will continue to reflect
                  the current details.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {event.clubName ? (
                <Link
                  href={hostHref}
                  className="inline-flex items-center justify-center rounded-md border border-[var(--line-soft)] bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[rgba(71,10,104,0.25)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  View club page
                </Link>
              ) : null}
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-md border border-[var(--line-soft)] bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[rgba(71,10,104,0.25)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Browse more events
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
