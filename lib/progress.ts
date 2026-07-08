import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";
import type { Track } from "@/types/content";

export type TrackProgress = {
  track: Track;
  totalLessons: number;
  completedLessons: number;
};

export type ProfileStats = {
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
};

// RLS scopes streaks/progress to the caller's own profiles (including
// child profiles under them), so the regular server client works for
// both the active profile and the parent's kids view.
export async function getProfileStats(profileId: string): Promise<ProfileStats> {
  const supabase = await createClient();
  const [{ data: streak }, { count }] = await Promise.all([
    supabase.from("streaks").select("*").eq("profile_id", profileId).maybeSingle(),
    supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .not("completed_at", "is", null),
  ]);
  return {
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    lessonsCompleted: count ?? 0,
  };
}

export async function getTrackProgress(
  profile: Pick<Profile, "id" | "is_child" | "age_band">,
): Promise<TrackProgress[]> {
  const supabase = await createClient();

  let trackQuery = supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (profile.is_child) {
    trackQuery = trackQuery.eq("audience", "kids").eq("age_band", profile.age_band);
  } else {
    trackQuery = trackQuery.eq("audience", "adult");
  }
  const { data: tracks } = await trackQuery;
  if (!tracks || tracks.length === 0) return [];

  // lessons -> modules -> track_id in one shot
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, modules!inner(track_id)")
    .eq("is_published", true)
    .in(
      "modules.track_id",
      tracks.map((t) => t.id),
    );

  const lessonIds = (lessons ?? []).map((l) => l.id);
  const { data: done } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("profile_id", profile.id)
        .not("completed_at", "is", null)
        .in("lesson_id", lessonIds)
    : { data: [] };
  const doneSet = new Set((done ?? []).map((d) => d.lesson_id));

  return tracks.map((track) => {
    const trackLessons = (lessons ?? []).filter(
      (l) => (l.modules as unknown as { track_id: string }).track_id === track.id,
    );
    return {
      track,
      totalLessons: trackLessons.length,
      completedLessons: trackLessons.filter((l) => doneSet.has(l.id)).length,
    };
  });
}
