import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export default function DocsPage() {
  return (
    <>
      <nav className="mb-8 flex items-center text-sm font-medium text-gray-500">
        <Link href="/" className="rounded-md transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Home</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span>Docs</span>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="text-[#51237f] font-semibold">Getting Started</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">Getting Started</h1>
        <p className="mb-10 text-lg font-medium leading-relaxed text-gray-600 md:text-xl">
          Welcome to the official community platform for Montgomery College. This guide will walk you through the basics of setting up your profile, finding organizations, and registering for events.
        </p>

        <h2 id="completing-your-profile" className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          1. Completing Your Profile
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Before joining any groups, you must set up your student or faculty profile. Your profile helps organizations verify your status and ensures you receive the correct communications for tailored campus events.
        </p>
        
        <div className="mb-8 rounded-r-lg border-l-4 border-blue-600 bg-[#f0f4ff] p-5 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Important: MC ID Required</h3>
              <div className="mt-2 text-sm text-blue-800 font-medium">
                <p>You must authenticate using your official MyMC credentials. Non-institutional email addresses cannot be used to create primary accounts.</p>
              </div>
            </div>
          </div>
        </div>

        <h2 id="finding-groups" className="text-2xl font-bold text-gray-900 mt-12 mb-4">
          2. Finding and Joining Groups
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          Montgomery College hosts over 100+ active student organizations. You can browse these through the <strong>Featured Groups</strong> section on your dashboard or by searching the directory.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-8 marker:text-[#51237f]">
          <li>Navigate to the <span className="font-semibold text-gray-900">Groups Index</span> using the top navigation.</li>
          <li>Filter by your campus (Rockville, Takoma Park/Silver Spring, or Germantown).</li>
          <li>Click <strong className="text-gray-900">Request to Join</strong> on any group&apos;s profile page.</li>
        </ul>

        <h2 id="managing-rsvps" className="text-2xl font-bold text-gray-900 mt-12 mb-4">
          3. Managing Event RSVPs
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          When you click on an event card from your dashboard, you will be taken to the event details page. From there, you can RSVP, add the event to your calendar, or contact the event organizers directly.
        </p>
        
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white mb-6 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">RSVP Status Code</th>
                <th scope="col" className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-700 bg-green-50/50">Confirmed</td>
                <td className="px-6 py-4 text-gray-600 font-medium">Your spot is reserved. A QR code is generated for entry.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-yellow-700 bg-yellow-50/50">Waitlisted</td>
                <td className="px-6 py-4 text-gray-600 font-medium">The event is at capacity. You will be notified if a spot opens.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-700 bg-blue-50/50">Pending Approval</td>
                <td className="px-6 py-4 text-gray-600 font-medium">The organizer must manually approve your request to attend.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-16 flex items-center justify-end border-t border-gray-100 pt-8 text-sm font-semibold">
          <Link href="/docs/navigating" className="flex items-center gap-1 rounded-lg bg-purple-50 px-4 py-3 text-[#51237f] transition-colors hover:bg-purple-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">
            Next: Navigating the Dashboard <ChevronRightIcon size={16}/>
          </Link>
        </div>

      </article>
    </>
  );
}
