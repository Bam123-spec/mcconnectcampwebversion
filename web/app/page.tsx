import Link from "next/link";
import { LogIn, Users, Search, Filter, ExternalLink } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { cookies } from "next/headers";

const MOCK_EVENTS = [
  {
    id: "1",
    name: "Spring Career Fair 2026",
    description: "Connect with over 50 top employers hiring for internships and full-time positions.",
    location: "Main Gymnasium",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    time: "10:00 AM - 3:00 PM",
    cover_image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Student Leadership Workshop",
    description: "Interactive session focusing on team building, effective communication, and leading campus clubs to success.",
    location: "Student Union Building",
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    time: "4:00 PM - 5:30 PM",
    cover_image_url: "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Networking Mixer",
    description: "Casual evening for students and alumni to connect over coffee and discuss career pathways.",
    location: "Private Location (sign in to display)",
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    time: "5:00 PM - 7:00 PM",
    cover_image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2670&auto=format&fit=crop",
  }
];

const LATEST_NEWS = [
  {
    id: "n1",
    title: "MC Newsletter - Spring Highlights",
    date: "Wednesday, February 18",
    author: "Jane Doe",
    group: "Student Life Office"
  },
  {
    id: "n2",
    title: "Launching Your Career: A Professional Session",
    date: "Monday, February 16",
    author: "John Smith",
    group: "Career Services"
  }
];

const FEATURED_CLUBS = [
  { id: "c1", name: "Cybersecurity Society", category: "Academic", members: 124 },
  { id: "c2", name: "Student Senate", category: "Governance", members: 45 },
  { id: "c3", name: "Raptor Athletics", category: "Sports", members: 310 },
];

const QUICK_LINKS = [
  { id: "q1", name: "Blackboard Learning", url: "#" },
  { id: "q2", name: "MyMC Portal", url: "#" },
  { id: "q3", name: "Interactive Campus Map", url: "#" },
  { id: "q4", name: "Library Services", url: "#" },
];

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("auth")?.value === "true";

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6f8]">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop')" }}
        />
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-white text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {isAuthenticated ? "Welcome back, Student!" : "Welcome to Raptor Connect!"}
          </h1>
          <p className="text-white text-xl md:text-2xl mb-8 font-medium drop-shadow-md">
            {isAuthenticated ? "Here's what's happening on your campus today." : "The official campus community platform at Montgomery College"}
          </p>
          {!isAuthenticated && (
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-[#51237f] hover:bg-[#51237f]/90 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg"
            >
              <LogIn size={18} />
              Sign In
            </Link>
          )}
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
                Upcoming Events <span className="text-gray-500 font-normal text-lg">(72)</span>
              </h2>
              
              {/* Filter / Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51237f] w-full md:w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {MOCK_EVENTS.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>

          {/* Latest News */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Latest News</h2>
              <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-300 transition-colors">
                All News
              </button>
            </div>

            <div className="bg-white border text-left border-gray-200 rounded-lg overflow-hidden flex flex-col">
              {LATEST_NEWS.map((news, index) => (
                <div 
                  key={news.id} 
                  className={`flex items-stretch ${index !== LATEST_NEWS.length - 1 ? 'border-b border-gray-200' : ''}`}
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
                    <button className="px-4 py-2 border border-gray-300 rounded font-semibold text-sm hover:bg-gray-50 flex items-center gap-2 w-full sm:w-auto justify-center">
                      Read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebars */}
        <aside className="w-full lg:w-80 space-y-8 shrink-0">
          
          {/* Featured Clubs */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-[#51237f] px-5 py-4">
              <h3 className="text-white font-bold text-lg">Featured Groups</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {FEATURED_CLUBS.map(club => (
                <div key={club.id} className="flex flex-col border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <Link href="#" className="font-bold text-[#51237f] hover:underline mb-1">
                    {club.name}
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
