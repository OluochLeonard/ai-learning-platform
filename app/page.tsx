import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold text-zinc-900">PLATFORM</h1>
      <p className="max-w-sm text-zinc-600">
        Learn AI skills, one bite-sized lesson at a time. The full landing
        page lands in Phase 2.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
