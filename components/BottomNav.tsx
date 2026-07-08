"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app", label: "Home" },
  { href: "/app/courses", label: "Courses" },
  { href: "/app/progress", label: "Progress" },
  { href: "/app/account", label: "Account" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-200 bg-white md:hidden">
      {TABS.map((tab) => {
        const active =
          tab.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-3 text-center text-xs font-medium ${
              active ? "text-indigo-600" : "text-zinc-500"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
