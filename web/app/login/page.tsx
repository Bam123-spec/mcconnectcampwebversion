import Link from "next/link";
import { ArrowLeft, ShieldCheck, Fingerprint } from "lucide-react";
import { OtherCollegeLogin } from "@/components/auth/other-college-login";
import { AUTH_ENABLED } from "@/lib/features";

const getErrorMessage = (code?: string) => {
  if (code === "mc_unavailable") {
    return "Montgomery College SSO is not configured for this deployment yet.";
  }

  return null;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = getErrorMessage(resolvedSearchParams?.error);

  if (!AUTH_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[var(--primary)] mb-6">
            <Fingerprint size={30} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">Institutional login is temporarily disabled</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            This deployment is not accepting web sign-ins right now.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#51237f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#45206b] transition-colors"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Ambience */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-all hover:-translate-x-1"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl shadow-purple-900/5 border border-white">
          <div className="text-center mb-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-100 to-purple-50 text-[var(--primary)] mb-6 shadow-inner border border-purple-100/50">
              <Fingerprint size={36} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-500 font-light leading-relaxed">
              Authenticate via your institutional portal to access the Raptor Connect dashboard.
            </p>
          </div>

          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-4">
            <a
              href="/auth/montgomery"
              className="w-full h-16 rounded-2xl border-2 border-transparent bg-gray-900 flex items-center justify-center gap-3 px-6 text-base font-bold text-white hover:bg-[var(--primary)] hover:shadow-xl hover:shadow-[var(--primary)]/20 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="h-6 w-6 rounded bg-white/20 flex items-center justify-center text-white text-[10px] font-black tracking-wider">
                MC
              </div>
              Login with Montgomery College
            </a>

            <OtherCollegeLogin />
          </div>

          <div className="mt-12 p-5 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-start gap-4">
            <ShieldCheck size={20} className="text-[var(--primary)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Your session is secured by AES-256 encryption. Raptor Connect never stores your raw institutional credentials.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Not a student yet? <Link href="/" className="text-[var(--primary)] hover:text-purple-700 transition-colors underline underline-offset-4">Learn more about the platform</Link>
        </p>
      </div>
    </div>
  );
}
