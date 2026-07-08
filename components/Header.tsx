import Link from "next/link";

const LINKS = [
  { href: "/app", label: "Home" },
  { href: "/app/courses", label: "Courses" },
  { href: "/app/progress", label: "Progress" },
  { href: "/app/account", label: "Account" },
];

export default function Header({ profileName }: { profileName: string }) {
  return (
    <header className="hidden border-b border-zinc-200 bg-white md:flex md:items-center md:justify-between md:px-8 md:py-4">
      <span className="text-lg font-semibold text-zinc-900">PLATFORM</span>
      <nav className="flex gap-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <span className="text-sm text-zinc-500">Learning as {profileName}</span>
    </header>
  );
}
