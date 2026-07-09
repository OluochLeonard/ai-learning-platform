export const metadata = { title: "You are offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl">📡</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
        No connection right now
      </h1>
      <p className="mt-2 max-w-xs text-zinc-400">
        Your lessons need the internet. Check your data or Wi-Fi and pull to
        refresh. Your streak will be waiting.
      </p>
    </div>
  );
}