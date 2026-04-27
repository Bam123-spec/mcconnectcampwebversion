import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--primary)]">Not found</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">This page is not available.</h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          The event, club, or help article may have moved. Use the campus directories to get back on track.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Browse events
          </Link>
          <Link
            href="/clubs"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Browse clubs
          </Link>
        </div>
      </section>
    </main>
  );
}
