export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-5 h-10 w-64 animate-pulse rounded bg-gray-200 sm:w-96" />
          <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-3/4 max-w-lg animate-pulse rounded bg-gray-200" />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="h-36 animate-pulse rounded-lg bg-gray-200" />
              <div className="mt-5 h-4 w-28 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-6 w-4/5 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
