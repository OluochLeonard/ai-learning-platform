import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/profile";
import { getProfileStats, getTrackProgress } from "@/lib/progress";
import type { Profile } from "@/types/profile";

export const metadata = { title: "Progress" };

function ProgressBars({
  items,
}: {
  items: Awaited<ReturnType<typeof getTrackProgress>>;
}) {
  return (
    <div className="space-y-3">
      {items.map(({ track, totalLessons, completedLessons }) => {
        const pct = totalLessons
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;
        return (
          <div key={track.id}>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-zinc-800">{track.title}</p>
              <p className="text-xs text-zinc-500">
                {completedLessons}/{totalLessons}
              </p>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className={`h-full rounded-full transition-all ${
                  pct === 100 ? "bg-green-500" : "bg-indigo-600"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function ProgressPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const supabase = await createClient();
  const [stats, trackProgress, { data: certs }] = await Promise.all([
    getProfileStats(profile.id),
    getTrackProgress(profile),
    supabase
      .from("certificates")
      .select("id, verification_code, issued_at, tracks(title)")
      .eq("profile_id", profile.id)
      .order("issued_at", { ascending: false }),
  ]);

  // Parent view: adults with child profiles see each kid's progress.
  let kids: { profile: Profile; stats: Awaited<ReturnType<typeof getProfileStats>>; tracks: Awaited<ReturnType<typeof getTrackProgress>> }[] = [];
  if (!profile.is_child) {
    const { data: children } = await supabase
      .from("profiles")
      .select("*")
      .eq("parent_profile_id", profile.id)
      .eq("is_child", true);
    kids = await Promise.all(
      (children ?? []).map(async (child) => ({
        profile: child,
        stats: await getProfileStats(child.id),
        tracks: await getTrackProgress(child),
      })),
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Progress</h1>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-2xl">🔥</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {stats.currentStreak}
          </p>
          <p className="text-xs text-zinc-500">day streak</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-2xl">🏆</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {stats.longestStreak}
          </p>
          <p className="text-xs text-zinc-500">best streak</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-2xl">✅</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {stats.lessonsCompleted}
          </p>
          <p className="text-xs text-zinc-500">lessons done</p>
        </div>
      </div>

      {trackProgress.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Your courses</h2>
          <div className="mt-3">
            <ProgressBars items={trackProgress} />
          </div>
        </div>
      )}

      {(certs ?? []).length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Certificates 🎓
          </h2>
          <div className="mt-3 space-y-2">
            {(certs ?? []).map((cert) => (
              <Link
                key={cert.id}
                href={`/app/certificate/${cert.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 hover:border-indigo-400"
              >
                <span className="text-sm font-medium text-zinc-800">
                  {(cert.tracks as unknown as { title: string })?.title}
                </span>
                <span className="text-xs text-indigo-600">View →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {kids.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Your kids</h2>
          <div className="mt-3 space-y-5">
            {kids.map(({ profile: kid, stats: kidStats, tracks }) => (
              <div key={kid.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-800">
                    {kid.display_name}{" "}
                    <span className="font-normal text-zinc-400">
                      ({kid.age_band})
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    🔥 {kidStats.currentStreak} · ✅ {kidStats.lessonsCompleted}
                  </p>
                </div>
                {tracks.length > 0 && (
                  <div className="mt-2">
                    <ProgressBars items={tracks} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
