"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#51237f]">Page unavailable</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">Something did not load correctly.</h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          The campus data connection may have timed out. Try again, or return to the main directory pages.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-[#51237f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3f1b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#51237f] hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
          >
            Open events
          </Link>
        </div>
      </section>
    </main>
  );
}
