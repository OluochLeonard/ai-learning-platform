import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">Page not found</h1>
      <p className="mt-2 max-w-xs text-zinc-600">
        This page moved or never existed. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Go home
      </Link>
    </div>
  );
}