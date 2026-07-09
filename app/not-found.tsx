import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Page not found</h1>
      <p className="mt-2 max-w-xs text-zinc-400">
        This page moved or never existed. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-6 btn-primary"
      >
        Go home
      </Link>
    </div>
  );
}