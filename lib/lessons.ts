import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";
import type { Lesson, LessonProgress, Module, Track } from "@/types/content";

// The SQL helper handles both adults (own subscription) and children
// (parent's subscription). Runs under the caller's RLS.
export async function hasActiveAccess(profileId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_active_access", {
    p_profile_id: profileId,
  });
  return data === true;
}

export async function getTracksForProfile(
  profile: Profile,
): Promise<Track[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tracks")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (profile.is_child) {
    query = query.eq("audience", "kids").eq("age_band", profile.age_band);
  } else {
    query = query.eq("audience", "adult");
  }

  const { data } = await query;
  return data ?? [];
}

export type LessonWithState = Lesson & {
  completed: boolean;
  locked: boolean;
};

export type ModuleWithLessons = Module & { lessons: LessonWithState[] };

// Sequential unlock within a module: a lesson is locked until every
// earlier lesson in its module is completed.
export async function getTrackDetail(
  slug: string,
  profile: Profile,
): Promise<{ track: Track; modules: ModuleWithLessons[] } | null> {
  const supabase = await createClient();

  const { data: track } = await supabase
    .from("tracks")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (!track) return null;
  // Server-side audience guard: child profiles only see their band's
  // kids tracks; adults only see adult tracks.
  if (profile.is_child) {
    if (track.audience !== "kids" || track.age_band !== profile.age_band) {
      return null;
    }
  } else if (track.audience !== "adult") {
    return null;
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("track_id", track.id)
    .order("sort_order", { ascending: true });

  const moduleIds = (modules ?? []).map((m) => m.id);
  const { data: lessons } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
    : { data: [] };

  const lessonIds = (lessons ?? []).map((l) => l.id);
  const { data: progress } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("*")
        .eq("profile_id", profile.id)
        .in("lesson_id", lessonIds)
    : { data: [] };

  const completedIds = new Set(
    (progress ?? [])
      .filter((p: LessonProgress) => p.completed_at)
      .map((p: LessonProgress) => p.lesson_id),
  );

  const modulesWithLessons: ModuleWithLessons[] = (modules ?? []).map((m) => {
    const moduleLessons = (lessons ?? []).filter(
      (l) => l.module_id === m.id,
    );
    let previousCompleted = true;
    const withState: LessonWithState[] = moduleLessons.map((l) => {
      const completed = completedIds.has(l.id);
      const locked = !previousCompleted;
      previousCompleted = previousCompleted && completed;
      return { ...l, completed, locked };
    });
    return { ...m, lessons: withState };
  });

  return { track, modules: modulesWithLessons };
}

export type LessonContext = {
  lesson: Lesson;
  module: Module;
  track: Track;
  siblings: Lesson[]; // published lessons in the same module, ordered
};

export async function getLessonContext(
  lessonId: string,
): Promise<LessonContext | null> {
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules(*, tracks(*))")
    .eq("id", lessonId)
    .eq("is_published", true)
    .single();
  if (!lesson?.modules?.tracks) return null;

  const { modules: moduleRow, ...lessonRow } = lesson;
  const { tracks: track, ...module } = moduleRow;
  if (!track.is_published) return null;

  const { data: siblings } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", module.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return { lesson: lessonRow, module, track, siblings: siblings ?? [] };
}
