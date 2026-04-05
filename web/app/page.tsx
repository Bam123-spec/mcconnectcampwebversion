import Link from "next/link";
import { Users, Search, ExternalLink } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { CampusAccessPanel } from "@/components/home/campus-access-panel";
import { AUTH_ENABLED } from "@/lib/features";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getClubPath } from "@/lib/club-utils";
import { getClubColor, getClubInitials, inferCampus, inferClubCategory, normalizeEventForWeb } from "@/lib/live-data";

type NewsRow = {
  id: string;
  title?: string | null;
  created_at?: string | null;
  category?: string | null;
  author?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

const QUICK_LINKS = [
  { id: "q1", name: "Events Guide", url: "/docs/events" },
  { id: "q2", name: "Getting Started", url: "/docs" },
  { id: "q3", name: "Interactive Campus Map", url: "/docs/navigating" },
  { id: "q4", name: "Privacy & Access", url: "/docs/privacy" },
];

export default async function Home() {
  const supabase = createServerSupabaseClient();

  const [{ data: eventsData }, { data: clubsData }, { data: newsData }] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, description, location, date, day, time, cover_image_url, clubs(name)")
      .order("date", { ascending: true, nullsFirst: false })
      .order("day", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("clubs")
      .select("id, name, description, cover_image_url, member_count")
      .order("member_count", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .limit(3),
    supabase
      .from("forum_posts")
      .select("id, title, created_at, category, author:author_id(full_name)")
      .eq("category", "announcements")
      .order("created_at", { ascending: false })
      .limit(2),
  ]);

  const eventIds = (eventsData ?? []).map((event) => event.id);
  const { data: registrations } = eventIds.length
    ? await supabase
        .from("event_registrations")
        .select("event_id")
        .in("event_id", eventIds)
        .limit(1000)
    : { data: [] as Array<{ event_id: string }> };

  const registrationCounts = new Map<string, number>();
  for (const row of registrations ?? []) {
    registrationCounts.set(row.event_id, (registrationCounts.get(row.event_id) ?? 0) + 1);
  }

  const featuredEvents = (eventsData ?? []).map((event) =>
    normalizeEventForWeb({
      ...event,
      rsvp_count: registrationCounts.get(event.id) ?? 0,
    })
  );
  const featuredClubs = (clubsData ?? []).map((club) => ({
    id: club.id,
    name: club.name,
    category: inferClubCategory(club),
    members: club.member_count ?? 0,
    campus: inferCampus(),
    initials: getClubInitials(club.name),
    color: getClubColor(club.id),
  }));
  const latestNews = ((newsData ?? []) as NewsRow[]).map((news) => {
    const author = Array.isArray(news.author) ? news.author[0] : news.author;
    const date = news.created_at ? new Date(news.created_at) : null;
    return {
      id: news.id,
      title: news.title || "Campus announcement",
      date: date
        ? date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })
        : "Recently posted",
      author: author?.full_name || "Montgomery College",
      group: news.category ? news.category.charAt(0).toUpperCase() + news.category.slice(1) : "Announcement",
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* Hero Section */}
      <section className="w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 md:px-6 md:py-12 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">
              Montgomery College
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
              What&apos;s happening this week at Montgomery College.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              Discover upcoming events, explore active clubs, and find the communities and programs students are joining right now.
            </p>
          </div>

          <div>
            <Link 
              href="/events" 
              className="inline-flex items-center rounded-md bg-[#51237f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45206b]"
            >
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Events & News */}
        <div className="flex-1 space-y-12">
          
          {/* Upcoming Events */}
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Upcoming Events <span className="text-gray-500 font-normal text-lg">({featuredEvents.length})</span>
              </h2>
              
              <form action="/events" className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    name="q"
                    placeholder="Search events..." 
                    className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51237f] w-full md:w-64"
                  />
                </div>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Search
                </button>
              </form>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} authEnabled={AUTH_ENABLED} />
              ))}
            </div>
          </section>

          {/* Latest News */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Latest News</h2>
              <Link href="/announcements" className="flex items-center gap-2 px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-300 transition-colors">
                All News
              </Link>
            </div>

            <div className="bg-white border text-left border-gray-200 rounded-lg overflow-hidden flex flex-col">
              {latestNews.length ? latestNews.map((news, index) => (
                <div 
                  key={news.id} 
                  className={`flex items-stretch ${index !== latestNews.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="w-32 md:w-48 bg-black text-white shrink-0 p-4 flex items-center justify-center font-bold text-center border-r border-gray-200">
                    <span className="text-base md:text-lg">MC NEWS</span>
                  </div>
                  <div className="flex-1 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#51237f] mb-1">{news.title}</h3>
                      <p className="text-sm text-gray-500">{news.date} - <span className="font-medium text-gray-700">{news.author}</span></p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Users size={14} /> {news.group}
                      </div>
                    </div>
                    <Link
                      href={`/announcements/${news.id}`}
                      className="px-4 py-2 border border-gray-300 rounded font-semibold text-sm hover:bg-gray-50 flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      Read
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-gray-500">
                  No announcement posts are available yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebars */}
        <aside className="w-full lg:w-80 space-y-8 shrink-0">
          <CampusAccessPanel />
          
          {/* Featured Clubs */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-[#51237f] px-5 py-4">
              <h3 className="text-white font-bold text-lg">Featured Groups</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {featuredClubs.map(club => (
                <div key={club.id} className="flex flex-col border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <Link href={getClubPath(club.id)} className="font-bold text-[#51237f] hover:underline mb-1 flex items-center gap-3">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-black text-white ${club.color}`}>
                      {club.initials}
                    </span>
                    <span>{club.name}</span>
                  </Link>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{club.category}</span>
                    <span className="flex items-center gap-1"><Users size={12}/> {club.members} members</span>
                  </div>
                </div>
              ))}
              <Link href="/clubs" className="w-full py-2 border border-gray-300 rounded text-center text-sm font-semibold hover:bg-gray-50 transition-colors mt-2 text-gray-700">
                View All Groups
              </Link>
            </div>
          </div>

          {/* Quick Links */}
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
