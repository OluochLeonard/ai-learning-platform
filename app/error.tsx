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
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-xs text-zinc-400">
        Not you, us. Give it another try and it should sort itself out.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 btn-primary"
      >
        Try again
      </button>
    </div>
  );
}