import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveProfile } from "@/lib/profile";
import { getTrackDetail, hasActiveAccess } from "@/lib/lessons";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const detail = await getTrackDetail(slug, profile);
  if (!detail) redirect("/app/courses");

  const access = await hasActiveAccess(profile.id);
  const { track, modules } = detail;

  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (n, m) => n + m.lessons.filter((l) => l.completed).length,
    0,
  );
  const pct = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-md p-6">
      <Link
        href="/app/courses"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        ← All courses
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
        {track.title}
      </h1>
      {track.description && (
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          {track.description}
        </p>
      )}

      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          {completedLessons} of {totalLessons} lessons done
        </p>
      </div>

      {!access && (
        <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.08] px-4 py-3.5">
          <p className="text-sm font-semibold text-amber-300">
            Lessons are locked
          </p>
          <p className="mt-0.5 text-sm text-zinc-400">
            Get a plan to unlock every lesson in this course.
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-block rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 transition-all hover:brightness-110"
          >
            See plans
          </Link>
        </div>
      )}

      <div className="mt-7 space-y-7">
        {modules.map((module) => (
          <div key={module.id}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {module.title}
            </h2>
            <div className="mt-3 space-y-2.5">
              {module.lessons.map((lesson) => {
                const disabled = !access || lesson.locked;
                const inner = (
                  <div
                    className={`flex items-center gap-3 rounded-2xl border p-4 ${
                      disabled
                        ? "border-white/[0.05] bg-white/[0.02] opacity-60"
                        : lesson.completed
                          ? "border-emerald-400/20 bg-emerald-400/[0.05]"
                          : "glass glass-hover"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ${
                        lesson.completed
                          ? "bg-emerald-400/15"
                          : disabled
                            ? "bg-white/[0.05]"
                            : "bg-gradient-to-br from-indigo-500/30 to-violet-500/30"
                      }`}
                    >
                      {lesson.completed ? "✅" : disabled ? "🔒" : "▶️"}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-zinc-100">
                        {lesson.title}
                      </span>
                      <span className="block text-xs text-zinc-500">
                        {lesson.estimated_minutes} min
                      </span>
                    </span>
                  </div>
                );
                return disabled ? (
                  <div key={lesson.id}>{inner}</div>
                ) : (
                  <Link key={lesson.id} href={`/app/lesson/${lesson.id}`}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}