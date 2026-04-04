import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export default function PrivacyPage() {
  return (
    <>
      <nav className="flex items-center text-sm text-gray-500 font-medium mb-8">
        <Link href="/" className="hover:text-[#51237f] transition-colors">Home</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <Link href="/docs" className="hover:text-[#51237f] transition-colors">Docs</Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="text-[#51237f] font-semibold">Privacy & Security</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">Privacy & Security</h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
          Learn how Montgomery College handles your data across the platform.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          Data Governance
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your personal data is managed by Montgomery College IT services and integrated rigidly securely. We comply with FERPA completely.
        </p>

        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-start items-center text-sm font-semibold">
          <Link href="/docs/messaging" className="text-[#51237f] hover:underline flex items-center gap-1 bg-purple-50 px-4 py-3 rounded-lg transition-colors hover:bg-purple-100">
            <ChevronRightIcon size={16} className="rotate-180"/> Previous: Messaging & Forums
          </Link>
        </div>
      </article>
    </>
  );
}
