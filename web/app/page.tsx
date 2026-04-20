import Link from "next/link";
import {
  BellRing,
  CalendarDays,
  Compass,
  ExternalLink,
  LogIn,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
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

const HERO_HIGHLIGHTS = [
  "Private event details stay gated until sign-in.",
  "Student life, clubs, events, and updates in one view.",
  "Built for commuters, organizers, and campus staff alike.",
];

export const dynamic = "force-dynamic";

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
    <div className="flex flex-col min-h-screen bg-[#f6f2ea]">
      <section className="relative overflow-hidden border-b border-black/5 bg-[linear-gradient(180deg,#f4f1fb_0%,#fbfbfe_56%,#ffffff_100%)]">
        <div className="hero-mesh absolute inset-0 opacity-35" aria-hidden="true" />
        <div
          className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(81,35,127,0.18),transparent_62%)]"
          aria-hidden="true"
        />
        <div
          className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#51237f]/8 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-14 h-80 w-80 rounded-full bg-[#00a0df]/8 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 md:px-6 md:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold text-[#51237f] shadow-[0_12px_32px_rgba(81,35,127,0.10)] backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Montgomery College&apos;s digital quad
              </div>

              <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#161212] md:text-6xl lg:text-7xl">
                {isAuthenticated ? "Campus momentum, already in motion." : "Campus life without the scavenger hunt."}
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[#4e4742] md:text-xl">
                {isAuthenticated
                  ? "Events, leadership updates, and student activity are waiting in one clean command center."
                  : "Raptor Connect brings events, clubs, announcements, and protected campus details into a single, polished front door for Montgomery College."}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#161212] px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Compass className="h-4 w-4" />
                  Explore what&apos;s happening
                </Link>
                <Link
                  href={isAuthenticated ? "/activity" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#161212]/12 bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#161212] shadow-[0_10px_30px_rgba(22,18,18,0.08)] backdrop-blur transition-colors hover:bg-white"
                >
                  {isAuthenticated ? <BellRing className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isAuthenticated ? "Open activity feed" : "Sign in for full access"}
                </Link>
              </div>

              <div className="mt-8 space-y-3">
                {HERO_HIGHLIGHTS.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3 text-sm text-[#413a36] md:text-base">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#51237f]" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="float-gentle relative overflow-hidden rounded-[32px] border border-[#51237f]/10 bg-[#14121a] p-6 text-white shadow-[0_30px_80px_rgba(42,26,71,0.18)]">
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_34%),linear-gradient(180deg,rgba(98,59,149,0.30),transparent_46%)]"
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Tonight at MC</p>
                      <h2 className="mt-2 text-2xl font-semibold">Campus pulse</h2>
                    </div>
                    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                      Live campus data
                    </div>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/8 bg-white/6 p-5 backdrop-blur-sm">
                    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                      <div>
                        <p className="text-sm text-white/60">Featured tonight</p>
                        <p className="mt-2 text-2xl font-semibold">{featuredEvent?.name ?? "Campus events"}</p>
                        <p className="mt-3 max-w-sm text-sm leading-6 text-white/72">
                          {featuredEvent?.description ?? "Browse campus events, student organizations, and public campus listings."}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <div className="rounded-full bg-[#f0b24d] px-3 py-2 text-right text-[#161212]">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.2em]">RSVP</div>
                            <div className="text-2xl font-semibold">{featuredEvent?.registrationsCount ?? 0}</div>
                          </div>
                          <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/75">
                            {featuredEvent?.location ?? "Montgomery College"}
                          </div>
                          <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/75">
                            {featuredEvent?.time || "See events"}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="rounded-[22px] border border-white/10 bg-[#201b28] p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-white/10 p-2">
                              <ShieldPlus className="h-4 w-4 text-[#c9b8ff]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Private access</p>
                              <p className="mt-2 text-base font-semibold">Sensitive details stay gated</p>
                              <p className="mt-2 text-sm leading-6 text-white/68">
                                Open browsing is public, but room-level details and protected logistics appear only after authentication.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Fresh activity</p>
                          <div className="mt-3 flex items-center justify-between text-sm text-white/82">
                            <span>{clubs.length} clubs listed</span>
                            <span>{events.length} events</span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[72%] rounded-full bg-[#8cc8ff]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                        <CalendarDays className="h-4 w-4 text-[#f0b24d]" />
                        <div className="mt-3 text-2xl font-semibold">{events.length}</div>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">Events opening registration</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                        <Users className="h-4 w-4 text-[#9dc9ff]" />
                        <div className="mt-3 text-2xl font-semibold">{clubs.length}</div>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">Clubs posted this week</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                        <BellRing className="h-4 w-4 text-[#f5a6c6]" />
                        <div className="mt-3 text-2xl font-semibold">{events.filter((event) => event.club_id).length}</div>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">New office alerts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-[30px] border border-[#51237f]/8 bg-white/82 p-5 shadow-[0_20px_60px_rgba(34,22,60,0.06)] backdrop-blur md:grid-cols-4 md:p-6">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="rounded-[22px] border border-[#51237f]/8 bg-[#faf9fe] px-5 py-4">
                <div className="text-3xl font-semibold tracking-[-0.04em] text-[#161212]">{metric.value}</div>
                <div className="mt-1 text-sm text-[#625a54]">{metric.label}</div>
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
