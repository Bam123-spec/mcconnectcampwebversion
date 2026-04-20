import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EventDetail } from "@/lib/events";

const formatDateLabel = (event: EventDetail) => {
  if (event.date) {
    const parsed = new Date(event.date);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(parsed);
    }
  }

  return event.day || "Date to be announced";
};

const formatTimeLabel = (event: EventDetail) => event.time || "Time to be announced";

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-[#51237f]">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-500">{label}</div>
        <div className="mt-1 text-sm font-semibold leading-6 text-gray-950">{value}</div>
      </div>
    </div>
  );
}

export function EventDetailPanel({ event }: { event: EventDetail }) {
  const registrationsLabel = `${event.registrationsCount} ${event.registrationsCount === 1 ? "registration" : "registrations"}`;

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500">
          <Link href="/" className="hover:text-[#51237f] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/events" className="hover:text-[#51237f] transition-colors">
            Events
          </Link>
          <span>/</span>
          <span className="text-gray-900">{event.name}</span>
        </nav>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#51237f]">
              <span className="rounded-full bg-purple-50 px-3 py-1 ring-1 ring-purple-100">
                Campus event
              </span>
              <span className="text-gray-400">Montgomery College campus events</span>
            </div>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                  {event.name}
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600">
                  {event.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Date</div>
                  <div className="mt-2 text-sm font-semibold text-gray-950">{formatDateLabel(event)}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Time</div>
                  <div className="mt-2 text-sm font-semibold text-gray-950">{formatTimeLabel(event)}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Attendance</div>
                  <div className="mt-2 text-sm font-semibold text-gray-950">{registrationsLabel}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-gray-100 lg:border-b-0 lg:border-r">
              <div className="p-6 sm:p-8">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                  <div className="relative aspect-[16/9]">
                    {event.cover_image_url ? (
                      <Image
                        src={event.cover_image_url}
                        alt={event.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f4f0fb_0%,#eef3f7_100%)]" />
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <InfoRow label="Date" value={formatDateLabel(event)} icon={CalendarDays} />
                  <InfoRow label="Time" value={formatTimeLabel(event)} icon={Clock} />
                  <InfoRow label="Location" value={event.location} icon={MapPin} />
                </div>

                <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#51237f]">About</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950">Event description</h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-8 text-gray-600">
                    {event.description}
                  </p>
                </section>
              </div>
            </div>

            <aside className="space-y-6 bg-[#fbfbfa] p-6 sm:p-8">
              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#51237f]">Organizer</div>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-gray-950">
                      {event.clubName || "Campus event"}
                    </h3>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-[#51237f]">
                    <Users size={18} />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {event.clubDescription ||
                    "This event is published through the campus event system and is available in the public web catalog."}
                </p>

                {event.clubMeetingTime ? (
                  <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <span className="font-semibold text-gray-950">Meeting time:</span> {event.clubMeetingTime}
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#51237f]">Summary</div>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-gray-950">Quick facts</h3>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-[#51237f]">
                    <ShieldCheck size={18} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <InfoRow label="Date" value={formatDateLabel(event)} icon={CalendarDays} />
                  <InfoRow label="Time" value={formatTimeLabel(event)} icon={Clock} />
                  <InfoRow label="Location" value={event.location} icon={MapPin} />
                  <InfoRow label="Attendance" value={registrationsLabel} icon={Users} />
                </div>
              </section>

              <section className="rounded-2xl border border-[#51237f]/10 bg-[#51237f] p-6 text-white">
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-purple-200">Status</div>
                <h3 className="mt-2 text-xl font-black tracking-tight">
                  Event details
                </h3>
                <p className="mt-3 text-sm leading-6 text-purple-100/90">
                  Review the schedule, location, organizer, and attendance details before you go.
                </p>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#51237f]">Navigation</div>
                <h3 className="mt-2 text-xl font-black tracking-tight text-gray-950">Go where you need</h3>

                <div className="mt-5 space-y-3">
                  <Link
                    href="/events"
                    className="inline-flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#51237f]/20 hover:text-[#51237f]"
                  >
                    Back to events
                    <ArrowLeft size={16} />
                  </Link>
                  <Link
                    href="/activity"
                    className="inline-flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#51237f]/20 hover:text-[#51237f]"
                  >
                    Open activity
                    <ExternalLink size={16} />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-between rounded-xl border border-[#51237f]/10 bg-[#51237f] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#43206a]"
                  >
                    Return home
                    <ArrowLeft size={16} />
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
