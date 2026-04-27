import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export default function NavigatingDashboardPage() {
  return (
    <>
      <nav className="flex items-center text-sm text-gray-500 font-medium mb-8">
        <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <Link href="/docs" className="hover:text-[var(--primary)] transition-colors">Docs</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="text-[var(--primary)] font-semibold">Navigating the Dashboard</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">Navigating the Dashboard</h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
          Once logged in, your dashboard is the central hub for all academic and community events.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          The Two-Column Layout
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          The left side of the dashboard is designed for ephemeral content: <strong>Latest News</strong> and <strong>Events</strong>. The right side is dedicated to static or curated features like <strong>Featured Groups</strong> and <strong>Campus Quick Links</strong>.
        </p>
        
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-sm text-gray-600 mb-8 font-mono">
          [ Placeholder visual diagram of the layout ]
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-sm font-semibold">
          <Link href="/docs" className="text-[var(--primary)] hover:underline flex items-center gap-1 bg-[rgba(71,10,104,0.08)] px-4 py-3 rounded-lg transition-colors hover:bg-[rgba(71,10,104,0.12)]">
            <ChevronRightIcon size={16} className="rotate-180"/> Previous: Getting Started
          </Link>
          <Link href="/docs/events" className="text-[var(--primary)] hover:underline flex items-center gap-1 bg-[rgba(71,10,104,0.08)] px-4 py-3 rounded-lg transition-colors hover:bg-[rgba(71,10,104,0.12)]">
            Next: Event Management <ChevronRightIcon size={16}/>
          </Link>
        </div>
      </article>
    </>
  );
}
