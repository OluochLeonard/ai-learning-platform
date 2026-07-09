"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl">😅</p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-xs text-zinc-600">
        Not you, us. Give it another try and it should sort itself out.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Try again
      </button>
    </div>
  );
}