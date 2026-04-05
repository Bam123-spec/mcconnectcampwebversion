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
          Learn how access, institutional sign-in, and account visibility work across the platform.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          Account Access
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Raptor Connect is designed around institutional access. Some sign-in paths use Montgomery College credentials, while other college logins may use separate authentication flows tied to the same platform account system.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          Privacy Expectations
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Profile, club, and event data shown in the web experience comes from the same underlying campus platform used by the app. Students should avoid sharing sensitive personal information in public-facing profile text or community content.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pt-10 border-t border-gray-100">
          Security Notes
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Authentication and authorization are enforced through the platform&apos;s existing account system. This documentation page is a product guide and should not be treated as a legal compliance statement or a formal security certification.
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
