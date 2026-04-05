import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export default function EventManagementPage() {
  return (
    <>
      <nav className="flex items-center text-sm text-gray-500 font-medium mb-8">
        <Link href="/" className="hover:text-[#51237f] transition-colors">Home</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <Link href="/docs" className="hover:text-[#51237f] transition-colors">Docs</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="text-[#51237f] font-semibold">Event Management</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">Event Management</h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
          Use the Events page to browse campus programming, RSVP quickly, and keep track of what you plan to attend.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          Attending Events
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Each event card shows the event name, location, date, and current RSVP count. If you are signed in, you can RSVP directly from the Events page. Your confirmed registrations appear on the Activity page automatically.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          What You Can Do Right Now
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-8 marker:text-[#51237f]">
          <li>Search upcoming events by name, description, or location.</li>
          <li>RSVP to future events when sign-in is enabled.</li>
          <li>Review past events separately from upcoming ones.</li>
          <li>Open the Activity page to see your registered events in one place.</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          Organizing and Officer Workflows
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          The public web experience currently focuses on discovery and RSVP management. Officer-specific event creation, approval, and room-request workflows should still be handled through the app surfaces that already support those actions.
        </p>

        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-sm font-semibold">
          <Link href="/docs/navigating" className="text-[#51237f] hover:underline flex items-center gap-1 bg-purple-50 px-4 py-3 rounded-lg transition-colors hover:bg-purple-100">
            <ChevronRightIcon size={16} className="rotate-180"/> Previous: Navigating the Dashboard
          </Link>
          <Link href="/docs/messaging" className="text-[#51237f] hover:underline flex items-center gap-1 bg-purple-50 px-4 py-3 rounded-lg transition-colors hover:bg-purple-100">
            Next: Messaging & Forums <ChevronRightIcon size={16}/>
          </Link>
        </div>
      </article>
    </>
  );
}
