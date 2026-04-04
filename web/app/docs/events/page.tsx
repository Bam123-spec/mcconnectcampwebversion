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
          Whether you&apos;re an attendee or an organizer, the events panel helps you coordinate campus functions efficiently.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          For Organizers
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Club officers can draft, submit, and request room reservations directly from their organization&apos;s page. Approval takes generally 2-3 business days.
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
