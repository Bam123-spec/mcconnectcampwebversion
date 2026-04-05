import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export default function MessagingPage() {
  return (
    <>
      <nav className="flex items-center text-sm text-gray-500 font-medium mb-8">
        <Link href="/" className="hover:text-[#51237f] transition-colors">Home</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <Link href="/docs" className="hover:text-[#51237f] transition-colors">Docs</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="text-[#51237f] font-semibold">Messaging & Forums</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">Messaging & Forums</h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
          Raptor Connect supports campus conversations through club spaces, officer coordination, and community updates surfaced across the platform.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          What to Expect
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Messaging and discussion features may vary by role and by surface. Some conversations are available only inside authenticated club, officer, or admin workflows. Public web pages do not expose every messaging feature from the mobile experience.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          Conduct Policy
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Use of campus communication tools remains subject to Montgomery College conduct expectations, moderation policies, and any applicable student communication guidelines.
        </p>

        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-sm font-semibold">
          <Link href="/docs/events" className="text-[#51237f] hover:underline flex items-center gap-1 bg-purple-50 px-4 py-3 rounded-lg transition-colors hover:bg-purple-100">
            <ChevronRightIcon size={16} className="rotate-180"/> Previous: Event Management
          </Link>
          <Link href="/docs/privacy" className="text-[#51237f] hover:underline flex items-center gap-1 bg-purple-50 px-4 py-3 rounded-lg transition-colors hover:bg-purple-100">
            Next: Privacy & Security <ChevronRightIcon size={16}/>
          </Link>
        </div>
      </article>
    </>
  );
}
