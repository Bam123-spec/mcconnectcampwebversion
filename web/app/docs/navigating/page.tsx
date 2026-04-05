import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export default function NavigatingDashboardPage() {
  return (
    <>
      <nav className="flex items-center text-sm text-gray-500 font-medium mb-8">
        <Link href="/" className="hover:text-[#51237f] transition-colors">Home</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <Link href="/docs" className="hover:text-[#51237f] transition-colors">Docs</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="text-[#51237f] font-semibold">Navigating the Dashboard</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">Navigating the Dashboard</h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
          Once logged in, the website becomes your central hub for events, club access, and campus updates.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          The Two-Column Layout
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          The homepage centers on <strong>Upcoming Events</strong> and <strong>Latest News</strong>, while the sidebar highlights <strong>Your Campus Access</strong>, featured groups, and quick resource links.
        </p>
        
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-sm text-gray-600 mb-8">
          Use the top navigation to move between <strong>Home</strong>, <strong>Clubs</strong>, <strong>Events</strong>, <strong>Activity</strong>, and <strong>Support &amp; Help</strong>. If you sign in, your joined clubs and leadership roles also appear in the header and on the homepage.
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-sm font-semibold">
          <Link href="/docs" className="text-[#51237f] hover:underline flex items-center gap-1 bg-purple-50 px-4 py-3 rounded-lg transition-colors hover:bg-purple-100">
            <ChevronRightIcon size={16} className="rotate-180"/> Previous: Getting Started
          </Link>
          <Link href="/docs/events" className="text-[#51237f] hover:underline flex items-center gap-1 bg-purple-50 px-4 py-3 rounded-lg transition-colors hover:bg-purple-100">
            Next: Event Management <ChevronRightIcon size={16}/>
          </Link>
        </div>
      </article>
    </>
  );
}
