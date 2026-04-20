import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-40 mt-auto border-t border-gray-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 text-sm md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/"
              className="relative mb-5 flex h-12 w-48 shrink-0 items-center transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2"
            >
              <Image 
                src="/connect-camp-logo.png" 
                alt="Connect Camp Logo" 
                fill
                className="object-contain object-left"
              />
            </Link>
            <p className="mb-4 max-w-sm leading-relaxed text-gray-600">
              A campus portal for Montgomery College students to find clubs, events, and trusted student life information.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-900">Campus Resources</h4>
            <ul className="space-y-2.5 text-gray-600">
               <li><a href="https://mymc.montgomerycollege.edu/" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">MyMC Portal</a></li>
               <li><a href="https://library.montgomerycollege.edu/" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">MC Library</a></li>
               <li><a href="https://www.montgomerycollege.edu/about-mc/campuses-and-locations/" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Campuses and Locations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-900">Connect Camp</h4>
            <ul className="space-y-2.5 text-gray-600">
               <li><Link href="/docs" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Help and FAQ</Link></li>
               <li><Link href="/events" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Campus Events</Link></li>
               <li><Link href="/clubs" className="transition-colors hover:text-[#51237f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51237f] focus-visible:ring-offset-2">Student Clubs</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-6 text-xs font-medium text-gray-500 md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Connect Camp. All rights reserved.</div>
          <div>Built for student life and campus participation.</div>
        </div>
      </div>
    </footer>
  );
}
