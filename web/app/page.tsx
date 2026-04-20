import Image from "next/image";
import Link from "next/link";
import {
  BellRing,
  CalendarDays,
  Compass,
  ExternalLink,
  LogIn,
  Users,
} from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { getPublicClubs } from "@/lib/clubs";
import { getPublicEvents } from "@/lib/events";

const QUICK_LINKS = [
  { id: "q1", name: "Blackboard Learning", url: "#" },
  { id: "q2", name: "MyMC Portal", url: "#" },
  { id: "q3", name: "Interactive Campus Map", url: "#" },
  { id: "q4", name: "Library Services", url: "#" },
];

export const dynamic = "force-dynamic";

const formatHeroDate = (date?: string | null, day?: string | null) => {
  if (date) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  }

  return day || "Date to be announced";
};

export default async function Home() {
  const isAuthenticated = false;
  const [events, clubs] = await Promise.all([getPublicEvents(), getPublicClubs()]);
  const featuredEvent = events[0];
  const heroMetrics = [
    { label: "Campus events", value: String(events.length) },
    { label: "Active student groups", value: String(clubs.length) },
    { label: "Open club listings", value: String(clubs.filter((club) => club.memberCount > 0).length) },
    { label: "Protected access", value: "On" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f5]">
      <section className="relative overflow-hidden border-b border-gray-200 bg-black text-white">
        <Image
          src="/montgomery-college-campus.jpg"
          alt="Montgomery College campus entrance"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-end">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-black/30 px-3 py-2 text-xs font-semibold uppercase text-white">
                Montgomery College
              </div>

              <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-none text-white md:text-6xl lg:text-7xl">
                Welcome, Raptors.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
                Find campus events, student organizations, and resources in one place.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100"
                >
                  <Compass className="h-4 w-4" />
                  Browse events
                </Link>
                <Link
                  href={isAuthenticated ? "/activity" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-black/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/40"
                >
                  {isAuthenticated ? <BellRing className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isAuthenticated ? "Open activity" : "Log in"}
                </Link>
              </div>
            </div>

            <div className="border-l-4 border-white/70 bg-black/35 px-6 py-5 backdrop-blur-sm">
              <div className="text-xs font-semibold uppercase text-white/70">Featured event</div>
              <Link href={featuredEvent ? `/events/${featuredEvent.id}` : "/events"} className="mt-2 block text-2xl font-semibold leading-tight text-white hover:underline">
                {featuredEvent?.name || "See what is happening on campus"}
              </Link>
              <div className="mt-4 space-y-2 text-sm text-white/80">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-white" />
                  <span>{formatHeroDate(featuredEvent?.date, featuredEvent?.day)}</span>
                </div>
                <div>{featuredEvent?.location || "Montgomery College"}</div>
                <div>{featuredEvent?.time || "Events updated live"}</div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 border-t border-white/25 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="border-l border-white/35 pl-4">
                <div className="text-2xl font-semibold text-white">{metric.value}</div>
                <div className="mt-1 text-xs font-medium uppercase text-white/70">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-12">
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Upcoming Events <span className="text-gray-500 font-normal text-lg">({events.length})</span>
              </h2>

              <div className="flex items-center gap-2">
                <Link href="/events" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors">
                  View all events
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.slice(0, 3).map(event => (
                <EventCard key={event.id} event={event} authEnabled={false} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Recent Campus Listings</h2>
              <Link href="/events" className="flex items-center gap-2 px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-300 transition-colors">
                All events
              </Link>
            </div>

            <div className="bg-white border text-left border-gray-200 rounded-lg overflow-hidden flex flex-col">
              {events.slice(3, 5).map((event, index) => (
                <div 
                  key={event.id} 
                  className={`flex items-stretch ${index !== events.slice(3, 5).length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="w-32 md:w-48 bg-black text-white shrink-0 p-4 flex items-center justify-center font-bold text-center border-r border-gray-200">
                    <span className="text-base md:text-lg">EVENT</span>
                  </div>
                  <div className="flex-1 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#51237f] mb-1">{event.name}</h3>
                      <p className="text-sm text-gray-500">{event.date || event.day || "Date to be announced"} - <span className="font-medium text-gray-700">{event.time || "Time to be announced"}</span></p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Users size={14} /> {event.clubName || "Campus office"}
                      </div>
                    </div>
                    <Link href={`/events/${event.id}`} className="px-4 py-2 border border-gray-300 rounded font-semibold text-sm hover:bg-gray-50 flex items-center gap-2 w-full sm:w-auto justify-center">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="w-full lg:w-80 space-y-8 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-[#51237f] px-5 py-4">
              <h3 className="text-white font-bold text-lg">Featured Groups</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {clubs.slice(0, 3).map(club => (
                <div key={club.id} className="flex flex-col border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <Link href={`/clubs/${club.slug}`} className="font-bold text-[#51237f] hover:underline mb-1">
                    {club.name}
                  </Link>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{club.category}</span>
                    <span className="flex items-center gap-1"><Users size={12}/> {club.memberCount} members</span>
                  </div>
                </div>
              ))}
              <Link href="/clubs" className="w-full py-2 border border-gray-300 rounded text-center text-sm font-semibold hover:bg-gray-50 transition-colors mt-2 text-gray-700">
                View All Groups
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-[#51237f] px-5 py-4">
              <h3 className="text-white font-bold text-lg">Campus Resources</h3>
            </div>
            <div className="flex flex-col">
              {QUICK_LINKS.map((link, index) => (
                <Link 
                  key={link.id} 
                  href={link.url}
                  className={`px-5 py-4 flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#51237f] transition-colors ${index !== QUICK_LINKS.length -1 ? 'border-b border-gray-100' : ''}`}
                >
                  {link.name}
                  <ExternalLink size={16} className="text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
