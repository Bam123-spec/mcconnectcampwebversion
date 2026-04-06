"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WebEventCardEvent } from "@/components/events/EventCard";
import { formatEventDateLabel } from "@/lib/live-data";

type SpotlightCarouselProps = {
  events: WebEventCardEvent[];
  fallbackCover: string;
};

export function SpotlightCarousel({ events, fallbackCover }: SpotlightCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => events.slice(0, 4), [events]);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    const slide = container.children.item(nextIndex) as HTMLElement | null;
    if (!slide) return;

    slide.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
    setActiveIndex(nextIndex);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const slideWidth = container.clientWidth;
    if (!slideWidth) return;

    const nextIndex = Math.round(container.scrollLeft / slideWidth);
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  if (!slides.length) {
    return null;
  }

  return (
    <section
      aria-label="Weekly spotlight events"
      className="relative overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-[0_20px_60px_-40px_rgba(17,24,39,0.4)]"
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((event) => (
          <article key={event.id} className="min-w-full snap-start">
            <Link
              href="/events"
              aria-label={`View details for ${event.name}`}
              className="group block"
            >
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={event.cover_image_url || fallbackCover}
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>

              <div className="space-y-5 p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#ede7f6] px-3 py-1 text-[11px] font-semibold text-[#51237f]">
                    Happening This Week
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {(event.rsvp_count ?? 0).toLocaleString()} going
                  </span>
                </div>

                <div>
                  <h2 className="text-[1.9rem] font-bold leading-tight tracking-[-0.02em] text-gray-950">
                    {event.name}
                  </h2>
                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    {formatEventDateLabel(event.date, event.time)}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{event.location}</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600">
                    {event.organizer_name || "Campus event"}
                  </p>
                  <span className="text-sm font-semibold text-[#51237f]">View details</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-5 z-10 flex justify-between px-5">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Show previous spotlight event"
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === slides.length - 1}
              aria-label="Show next spotlight event"
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/92 px-3 py-2 shadow-sm backdrop-blur">
            {slides.map((event, index) => (
              <button
                key={event.id}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to spotlight event ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === activeIndex ? "bg-[#51237f] w-6" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
