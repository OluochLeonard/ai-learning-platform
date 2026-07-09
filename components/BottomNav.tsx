"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app", label: "Home", icon: "🏠" },
  { href: "/app/courses", label: "Courses", icon: "📚" },
  { href: "/app/progress", label: "Progress", icon: "🔥" },
  { href: "/app/account", label: "Account", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.08] bg-[#0a0a16]/90 backdrop-blur-lg md:hidden">
      <div className="flex pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active =
            tab.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-white" : "text-zinc-500"
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
              <span className={active ? "" : "opacity-60 grayscale"}>
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}