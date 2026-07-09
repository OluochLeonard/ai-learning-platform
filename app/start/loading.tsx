export default function StartLoading() {
  return (
    <div className="mx-auto w-full max-w-md animate-pulse px-5 py-6">
      <div className="h-2 w-full rounded-full bg-zinc-200" />
      <div className="mt-10 h-8 w-3/4 rounded-lg bg-zinc-200" />
      <div className="mt-6 space-y-3">
        <div className="h-14 rounded-xl bg-zinc-200" />
        <div className="h-14 rounded-xl bg-zinc-200" />
        <div className="h-14 rounded-xl bg-zinc-200" />
      </div>
    </div>
  );
}