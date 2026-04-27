import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Fingerprint } from "lucide-react";
import { OtherCollegeLogin } from "@/components/auth/other-college-login";
import { AUTH_ENABLED } from "@/lib/features";
import { getCurrentProfile } from "@/lib/auth-session";

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/activity");
  }

  if (!AUTH_ENABLED) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[rgba(71,10,104,0.08)] text-[var(--primary)]">
            <Fingerprint size={30} strokeWidth={1.5} />
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900">Institutional login is temporarily disabled</h1>
          <p className="mb-8 leading-relaxed text-gray-600">
            The web portal is currently being finalized while deployment and campus SSO setup are completed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <Link 
        href="/" 
        className="mb-10 inline-flex items-center gap-2 rounded-md text-sm font-medium text-gray-600 transition-colors hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-start">
        <section className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[rgba(71,10,104,0.08)] text-[var(--primary)]">
            <Fingerprint size={28} strokeWidth={1.7} />
          </div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--primary)]">Student access</p>
          <h1 className="max-w-xl text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Sign in to Raptor Connect.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Use the account connected to your campus profile to manage RSVPs, club memberships, and student leadership access.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="font-semibold text-gray-950">Events</div>
              <p className="mt-1 leading-6">RSVP and check what you have coming up.</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="font-semibold text-gray-950">Clubs</div>
              <p className="mt-1 leading-6">Join groups and keep membership status current.</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="font-semibold text-gray-950">Privacy</div>
              <p className="mt-1 leading-6">Protected details stay behind authentication.</p>
            </div>
          </div>
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">Log in</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Enter your account details to continue.
            </p>
          </div>

          <div className="space-y-4">
            <OtherCollegeLogin defaultExpanded />
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <ShieldCheck size={19} className="mt-0.5 flex-shrink-0 text-[var(--primary)]" />
            <p className="text-xs font-medium leading-relaxed text-gray-600">
              Raptor Connect uses a secure web session and only shows protected campus information after sign-in.
            </p>
          </div>

          <p className="mt-7 text-center text-sm font-medium text-gray-500">
            Need help? <Link href="/docs" className="text-[var(--primary)] underline underline-offset-4 transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2">Read the student guide</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
