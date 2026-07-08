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
      <Link href="/app/courses" className="text-sm text-zinc-500">
        ← All courses
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
        {track.title}
      </h1>
      {track.description && (
        <p className="mt-1 text-sm text-zinc-600">{track.description}</p>
      )}

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {completedLessons} of {totalLessons} lessons done
        </p>
      </div>

      {!access && (
        <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800">
            Lessons are locked
          </p>
          <p className="mt-0.5 text-sm text-amber-800">
            Get a plan to unlock every lesson in this course.
          </p>
          <Link
            href="/pricing"
            className="mt-2 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
          >
            See plans
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {modules.map((module) => (
          <div key={module.id}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              {module.title}
            </h2>
            <div className="mt-2 space-y-2">
              {module.lessons.map((lesson) => {
                const disabled = !access || lesson.locked;
                const inner = (
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-4 ${
                      disabled
                        ? "border-zinc-200 bg-zinc-50 opacity-70"
                        : "border-zinc-200 bg-white hover:border-indigo-400"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-base">
                      {lesson.completed ? "✅" : disabled ? "🔒" : "▶️"}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-zinc-900">
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
