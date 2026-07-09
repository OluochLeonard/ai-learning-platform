export default function StartLoading() {
  return (
    <div className="mx-auto w-full max-w-md animate-pulse px-5 py-6">
      <div className="h-2 w-full rounded-full bg-white/[0.06]" />
      <div className="mt-10 h-8 w-3/4 rounded-lg bg-white/[0.06]" />
      <div className="mt-6 space-y-3">
        <div className="h-14 rounded-xl bg-white/[0.06]" />
        <div className="h-14 rounded-xl bg-white/[0.06]" />
        <div className="h-14 rounded-xl bg-white/[0.06]" />
      </div>
    </div>
  );
}