import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, MapPin, Users } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getDisplayEventTurnout } from "@/lib/demo-analytics";
import { createServerSupabaseClient } from "@/lib/supabase";

type EventRow = {
  id: string;
  name?: string | null;
  description?: string | null;
  location?: string | null;
  date?: string | null;
  day?: string | null;
  time?: string | null;
  cover_image_url?: string | null;
  club_id?: string | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

const fallbackCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const formatEventDate = (dateValue?: string | null, time?: string | null) => {
  const source = dateValue ?? null;
  if (!source) return time || "Date TBA";

  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return time ? `${source} • ${time}` : source;

  const label = parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return time ? `${label} • ${time}` : label;
};

const getEventDetails = async (id: string) => {
  const supabase = createServerSupabaseClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name, description, location, date, day, time, cover_image_url, club_id, clubs(name)")
    .eq("id", id)
    .maybeSingle();

  if (!event) return null;

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("event_id", id)
    .limit(5000);

  const registrationCount = registrations?.length ?? 0;
  const club = firstItem((event as EventRow).clubs);

  return {
    event: event as EventRow,
    clubName: club?.name || "Campus Event",
    turnout: getDisplayEventTurnout({
      eventId: event.id,
      eventName: event.name,
      realCount: registrationCount,
    }),
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getEventDetails(id);

  if (!data) {
    return {
      title: "Event Not Found | Raptor Connect",
    };
  }

  return {
    title: `${data.event.name || "Event"} | Raptor Connect`,
    description: data.event.description || data.event.location || "Campus event details",
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getEventDetails(id);

  if (!data) {
    notFound();
  }

  const { event, clubName, turnout } = data;
  const dateLabel = formatEventDate(event.date || event.day, event.time);
  const description =
    event.description?.trim() ||
    "More details about this campus event will be shared here as the organizers publish updates.";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#51237f] transition hover:text-[#45206b]"
        >
          <ChevronLeft size={16} />
          Back to events
        </Link>
      </div>

      <article className="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-[0_24px_70px_-48px_rgba(17,24,39,0.24)]">
        <div className="relative h-72 w-full bg-gray-100">
          <ImageWithFallback
            src={event.cover_image_url}
            fallbackSrc={fallbackCover}
            alt={event.name || "Campus event"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#51237f] backdrop-blur-sm">
              {clubName}
            </span>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              {event.name}
            </h1>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1.3fr_0.7fr] md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">About this event</p>
            <div className="mt-4 rounded-[24px] border border-gray-200 bg-[#fafafa] px-5 py-5">
              <p className="whitespace-pre-wrap text-[15px] leading-8 text-gray-700">{description}</p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_16px_36px_-30px_rgba(17,24,39,0.22)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Event details</p>
              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <CalendarDays size={18} className="mt-0.5 text-[#51237f]" />
                  <div>
                    <p className="font-semibold text-gray-950">Date and time</p>
                    <p className="mt-1 text-gray-600">{dateLabel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-[#51237f]" />
                  <div>
                    <p className="font-semibold text-gray-950">Location</p>
                    <p className="mt-1 text-gray-600">{event.location || "Location TBA"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users size={18} className="mt-0.5 text-[#51237f]" />
                  <div>
                    <p className="font-semibold text-gray-950">Attendance</p>
                    <p className="mt-1 text-gray-600">{turnout} going</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-gray-200 bg-[#fafafa] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Next step</p>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Return to the events page to RSVP, open your event pass, or keep browsing what&apos;s happening around campus.
              </p>
              <Link
                href="/events"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
              >
                Back to events
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
