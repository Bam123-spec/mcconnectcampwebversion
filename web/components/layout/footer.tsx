import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-40 mt-auto border-t border-[var(--line-soft)] bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-10 text-sm md:grid-cols-[minmax(0,1.3fr)_0.7fr_0.7fr]">
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="relative mb-5 flex h-12 w-48 shrink-0 items-center rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              <Image 
                src="/connect-camp-logo.png" 
                alt="Connect Camp Logo" 
                fill
                className="object-contain object-left"
              />
            </Link>
            <p className="mb-5 max-w-md text-sm leading-7 text-gray-600">
              A unified campus experience for Montgomery College students to find events, join organizations, and reach trusted student life resources.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/events" className="btn-secondary text-sm">Events</Link>
              <Link href="/clubs" className="btn-secondary text-sm">Clubs</Link>
              <Link href="/docs" className="btn-secondary text-sm">Help</Link>
            </div>
          </div>
          
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-gray-900">Campus Resources</h4>
            <ul className="space-y-2.5 text-gray-600">
               <li><a href="https://mymc.montgomerycollege.edu/" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">MyMC Portal</a></li>
               <li><a href="https://library.montgomerycollege.edu/" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">MC Library</a></li>
               <li><a href="https://www.montgomerycollege.edu/about-mc/campuses-and-locations/" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Campuses and Locations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-gray-900">Connect Camp</h4>
            <ul className="space-y-2.5 text-gray-600">
               <li><Link href="/docs" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Help and FAQ</Link></li>
               <li><Link href="/events" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Campus Events</Link></li>
               <li><Link href="/clubs" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Student Clubs</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-6 text-xs font-medium text-gray-500 md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Connect Camp. All rights reserved.</div>
          <div>Modern tools for campus participation, built around Montgomery College.</div>
        </div>
      </div>
    </footer>
  );
}
