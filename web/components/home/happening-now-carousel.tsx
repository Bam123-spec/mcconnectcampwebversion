"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

type HappeningNowEvent = {
  id: string;
  title: string;
  clubName: string;
  when: string;
  location: string;
  description: string;
  cover: string;
  turnout: number;
  href: string;
  startsAt: string | null;
};

const fallbackEventCover =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";

const getCountdown = (startsAt: string | null, now: number) => {
  if (!startsAt) {
    return { label: "Time TBA", tone: "muted" as const };
  }

  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start)) {
    return { label: "Time TBA", tone: "muted" as const };
  }

  const diff = start - now;
  const liveWindowMs = 2 * 60 * 60 * 1000;

  if (diff <= 0 && diff > -liveWindowMs) {
    return { label: "Live now", tone: "live" as const };
  }

  if (diff <= 0) {
    return { label: "Started", tone: "muted" as const };
  }

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return { label: `Starts in ${days}d ${hours}h`, tone: "soon" as const };
  }

  if (hours > 0) {
    return { label: `Starts in ${hours}h ${minutes}m`, tone: "soon" as const };
  }

  return { label: `Starts in ${Math.max(minutes, 1)}m`, tone: "soon" as const };
};

export function HappeningNowCarousel({ events }: { events: HappeningNowEvent[] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  if (!events.length) return null;

  return (
    <section className="rounded-[12px] border border-gray-200 bg-white p-5 shadow-[0_14px_34px_-26px_rgba(17,24,39,0.22)]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Happening Now</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">Live and upcoming events</h2>
        </div>
        <Link href="/events" className="text-sm font-semibold text-[#51237f] hover:underline">
          Open calendar
        </Link>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {events.map((event) => {
          const countdown = getCountdown(event.startsAt, now);
          const badgeClass =
            countdown.tone === "live"
              ? "bg-[#51237f] text-white"
              : countdown.tone === "soon"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-600";

          return (
            <article
              key={event.id}
              className="min-w-[320px] max-w-[360px] flex-1 snap-start overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[0_12px_28px_-24px_rgba(17,24,39,0.18)]"
            >
              <div className="relative h-52 bg-gray-100">
                <ImageWithFallback src={event.cover} fallbackSrc={fallbackEventCover} alt={event.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${badgeClass}`}>
                    {countdown.label}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-sm font-medium text-white/88">{event.clubName}</p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight text-white">{event.title}</h3>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-gray-400" />
                    <span>{event.when}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-gray-400" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={15} className="text-gray-400" />
                    <span>{countdown.label}</span>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">{event.description}</p>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#51237f]">
                    <Users size={15} />
                    {event.turnout} going
                  </span>
                  <Link
                    href={event.href}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#51237f] px-4 text-sm font-semibold text-white transition hover:bg-[#45206b]"
                  >
                    Quick join
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
