"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Users, label: "Clubs", href: "/clubs" },
  { icon: MessageSquare, label: "Forums", href: "/forums" },
  { icon: Bell, label: "Campus Alerts", href: "/alerts" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-white/80 backdrop-blur-xl border-r border-gray-100/50 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-8 pb-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[var(--primary)]/20 group-hover:scale-105 transition-transform duration-300">
            R
          </div>
          <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-[var(--primary)] transition-colors">
            Raptor<span className="text-[var(--primary)] opacity-80">Connect</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "text-[var(--primary)] bg-[rgba(71,10,104,0.08)] shadow-sm"
                  : "text-gray-500 hover:text-[var(--primary)] hover:bg-gray-50"
              )}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-[var(--primary)]" : "text-gray-400 group-hover:text-[var(--primary)]"
                )} 
              />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100/50 space-y-1.5 bg-gray-50/30">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-gray-500 hover:text-[var(--primary)] hover:bg-gray-50 transition-all duration-300 group">
          <Settings size={22} strokeWidth={2} className="text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
          Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300 group">
          <LogOut size={22} strokeWidth={2} className="text-red-400 group-hover:text-red-600 transition-colors" />
          Logout
        </button>
      </div>
    </aside>
  );
}
