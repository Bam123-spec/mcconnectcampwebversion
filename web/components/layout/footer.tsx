import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto z-40 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="relative h-12 w-48 mb-6 hover:opacity-80 transition-opacity flex items-center shrink-0">
              <Image 
                src="/connect-camp-logo.png" 
                alt="Connect Camp Logo" 
                fill
                className="object-contain object-left"
              />
            </Link>
            <p className="text-gray-500 mb-4 max-w-sm leading-relaxed">
              Empowering students to achieve their academic and professional goals through community engagement and campus leadership.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4 tracking-wide uppercase text-xs">Resources</h4>
            <ul className="space-y-2.5 text-gray-500">
               <li><Link href="/clubs" className="hover:text-[#51237f] transition-colors">Campus Directory</Link></li>
               <li><Link href="/docs" className="hover:text-[#51237f] transition-colors">Getting Started</Link></li>
               <li><Link href="/docs/navigating" className="hover:text-[#51237f] transition-colors">Campus Navigation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4 tracking-wide uppercase text-xs">Platform Support</h4>
            <ul className="space-y-2.5 text-gray-500">
               <li><Link href="/docs" className="hover:text-[#51237f] transition-colors">Help Center & FAQ</Link></li>
               <li><Link href="/docs/events" className="hover:text-[#51237f] transition-colors">Event Registration Help</Link></li>
               <li><Link href="/docs/privacy" className="hover:text-[#51237f] transition-colors">Accessibility & Privacy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-400">
          <div>© {new Date().getFullYear()} Connect Camp. All rights reserved.</div>
          <div className="flex items-center gap-1 text-gray-500">
            <span>The premier involvement platform for higher education.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
