import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Megaphone, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Homepage Directions | Raptor Connect",
  description: "Internal comparison page for homepage design directions.",
};

const sampleEvents = [
  {
    id: "evt-1",
    name: "Spring Career Fair",
    meta: "Thu, Apr 9 • Main Gymnasium",
    count: "86 students going",
  },
  {
    id: "evt-2",
    name: "EESA Cultural Night",
    meta: "Mon, Apr 27 • Performing Arts Hall",
    count: "112 students going",
  },
  {
    id: "evt-3",
    name: "Leadership Workshop",
    meta: "Sat, Apr 11 • Student Union Building",
    count: "41 students going",
  },
];

const sampleClubs = [
  "Computer Science Club",
  "Student Senate",
  "Cybersecurity Society",
];

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#51237f]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-gray-950">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{body}</p>
    </div>
  );
}

export default function DesignLabPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white px-6 py-7 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#51237f]">Internal Review</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-gray-950">Homepage directions</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              These are four cleaner homepage directions for the campus portal. None of them are final. The goal is to
              decide the right tone before we keep refining the real homepage.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back to homepage
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-12">
          <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <SectionHeader
              eyebrow="Direction 01"
              title="Utility-first"
              body="This removes the big hero almost entirely. Students land on a concise intro, fast actions, and the first useful content immediately. This is the most practical and least risky direction."
            />

            <div className="rounded-[1.5rem] border border-gray-200 bg-[#fcfcfd] p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold text-[#51237f]">Montgomery College Campus Life</p>
                  <h3 className="mt-2 text-4xl font-black tracking-[-0.04em] text-gray-950">
                    What&apos;s happening this week.
                  </h3>
                  <p className="mt-3 text-base leading-7 text-gray-600">
                    Upcoming events, featured clubs, and the updates students actually need.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <button className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left text-sm font-semibold text-gray-800 shadow-sm">
                    Explore Events
                  </button>
                  <button className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left text-sm font-semibold text-gray-800 shadow-sm">
                    Find Clubs
                  </button>
                  <button className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left text-sm font-semibold text-gray-800 shadow-sm">
                    Campus Map
                  </button>
                  <button className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left text-sm font-semibold text-gray-800 shadow-sm">
                    My Activity
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {sampleEvents.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Event</p>
                    <h4 className="mt-2 text-lg font-bold text-gray-950">{event.name}</h4>
                    <p className="mt-2 text-sm text-gray-600">{event.meta}</p>
                    <p className="mt-4 text-sm font-semibold text-[#51237f]">{event.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <SectionHeader
              eyebrow="Direction 02"
              title="Editorial split"
              body="This keeps a homepage statement, but makes it feel more curated and premium instead of promotional. Good if you still want a strong first impression without a giant image hero."
            />

            <div className="grid gap-6 rounded-[1.5rem] border border-gray-200 bg-white p-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col justify-between rounded-[1.5rem] bg-[#f7f1fb] p-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Campus Brief</p>
                  <h3 className="mt-4 text-5xl font-black tracking-[-0.05em] text-gray-950">
                    Start with what matters this week.
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-7 text-gray-700">
                    See the events drawing students in, the clubs creating momentum, and the updates worth paying attention to.
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  <button className="rounded-full bg-[#51237f] px-5 py-3 text-sm font-semibold text-white">See events</button>
                  <button className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800">
                    See clubs
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-gray-200 bg-[#fcfcfd] p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    <Sparkles size={14} />
                    Spotlight
                  </div>
                  <h4 className="mt-3 text-2xl font-bold text-gray-950">{sampleEvents[0].name}</h4>
                  <p className="mt-2 text-sm text-gray-600">{sampleEvents[0].meta}</p>
                  <p className="mt-4 text-sm font-semibold text-[#51237f]">{sampleEvents[0].count}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {sampleEvents.slice(1).map((event) => (
                    <div key={event.id} className="rounded-[1.25rem] border border-gray-200 bg-white p-4">
                      <h5 className="text-base font-bold text-gray-950">{event.name}</h5>
                      <p className="mt-2 text-sm text-gray-600">{event.meta}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <SectionHeader
              eyebrow="Direction 03"
              title="Campus bulletin"
              body="This feels the most institutional in a good way. Less like a startup site, more like a clear student portal. If you want it to feel trustworthy and simple, this is a strong candidate."
            />

            <div className="grid gap-6 rounded-[1.5rem] border border-gray-200 bg-[#fbfbfc] p-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.25rem] border border-gray-200 bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">This Week</p>
                <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-gray-950">Montgomery College bulletin</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 text-[#51237f]" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-gray-950">{sampleEvents[0].name}</p>
                      <p className="text-sm text-gray-600">{sampleEvents[0].meta}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Megaphone className="mt-0.5 text-[#51237f]" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-gray-950">Student senate nominations open</p>
                      <p className="text-sm text-gray-600">Leadership applications close Friday at 5:00 PM.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 text-[#51237f]" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-gray-950">Campus map update</p>
                      <p className="text-sm text-gray-600">New wayfinding is available for parking and major buildings.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-[1.25rem] border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-950">Active organizations</h4>
                  <button className="text-sm font-semibold text-[#51237f]">View all</button>
                </div>
                <div className="mt-5 divide-y divide-gray-100">
                  {sampleClubs.map((club) => (
                    <div key={club} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-semibold text-gray-950">{club}</p>
                        <p className="mt-1 text-sm text-gray-500">Montgomery College</p>
                      </div>
                      <button className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <SectionHeader
              eyebrow="Direction 04"
              title="Social feed start"
              body="This is the most student-facing option. The homepage behaves more like a feed immediately. Good if you want the product to feel active and alive, but it is more UI-heavy than the other directions."
            />

            <div className="rounded-[1.5rem] border border-gray-200 bg-white p-6">
              <div className="flex flex-wrap gap-2">
                <button className="rounded-full bg-[#51237f] px-4 py-2 text-sm font-semibold text-white">For You</button>
                <button className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Events</button>
                <button className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Clubs</button>
                <button className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Announcements</button>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  {sampleEvents.map((event) => (
                    <div key={event.id} className="rounded-[1.25rem] border border-gray-200 bg-[#fcfcfd] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-950">{event.name}</p>
                          <p className="mt-1 text-sm text-gray-600">{event.meta}</p>
                          <p className="mt-3 text-sm font-medium text-[#51237f]">{event.count}</p>
                        </div>
                        <button className="rounded-full bg-[#51237f] px-4 py-2 text-sm font-semibold text-white">RSVP</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.25rem] border border-gray-200 bg-[#faf7fd] p-5">
                  <h4 className="text-lg font-bold text-gray-950">From your clubs</h4>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-white bg-white p-4">
                      <p className="text-sm font-semibold text-gray-950">Computer Science Club posted a new meetup.</p>
                      <p className="mt-1 text-sm text-gray-500">2 hours ago</p>
                    </div>
                    <div className="rounded-xl border border-white bg-white p-4">
                      <p className="text-sm font-semibold text-gray-950">Student Senate added a campus update.</p>
                      <p className="mt-1 text-sm text-gray-500">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
