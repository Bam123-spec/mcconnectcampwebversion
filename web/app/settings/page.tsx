import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl flex-col px-4 py-10 md:px-6 lg:px-8">
      <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_16px_32px_-28px_rgba(17,24,39,0.28)] md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Settings</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-gray-950">Account preferences</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
          This is the lightweight settings surface for the web app. More account and notification controls can be added
          here without sending users into an empty route.
        </p>

        <div className="mt-8 grid gap-4">
          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-bold text-gray-950">Profile and account</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Review your personal dashboard, campus activity, and club participation from one place.
            </p>
            <Link
              href="/activity"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-[#51237f] px-4 text-sm font-semibold text-white transition hover:bg-[#45206b]"
            >
              Open activity
            </Link>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-bold text-gray-950">Club and event preferences</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Browse clubs and events to tune what you follow, RSVP to, and return to most often.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/clubs"
                className="inline-flex h-10 items-center rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-800 transition hover:bg-white"
              >
                View clubs
              </Link>
              <Link
                href="/events"
                className="inline-flex h-10 items-center rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-800 transition hover:bg-white"
              >
                View events
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
