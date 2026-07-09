import Link from "next/link";

const LINKS = [
  { href: "/app", label: "Home" },
  { href: "/app/courses", label: "Courses" },
  { href: "/app/progress", label: "Progress" },
  { href: "/app/account", label: "Account" },
];

export default function Header({ profileName }: { profileName: string }) {
  return (
    <header className="hidden border-b border-white/[0.06] bg-[#07070f]/80 backdrop-blur-md md:flex md:items-center md:justify-between md:px-8 md:py-4">
      <span className="text-lg font-bold tracking-tight text-white">
        PLAT<span className="text-gradient">FORM</span>
      </span>
      <nav className="flex gap-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <span className="text-sm text-zinc-500">Learning as {profileName}</span>
    </header>
  );
}