"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/profile";
import { getLessonContext, hasActiveAccess } from "@/lib/lessons";
import { updateStreak, type StreakResult } from "@/lib/streak";
import { ensureCertificate } from "@/lib/certificates";
import { QUIZ_PASS_MARK } from "@/types/content";

export type CompletionResult =
  | {
      ok: true;
      streak: StreakResult;
      nextLessonId: string | null;
      trackSlug: string;
      certificateId: string | null;
    }
  | { ok: false; error: string };

export async function completeLesson(
  lessonId: string,
  quizScore: number | null,
): Promise<CompletionResult> {
  const profile = await getActiveProfile();
  if (!profile) return { ok: false, error: "No active profile" };

  const context = await getLessonContext(lessonId);
  if (!context) return { ok: false, error: "Lesson not found" };

  if (!(await hasActiveAccess(profile.id))) {
    return { ok: false, error: "No active subscription" };
  }

  const supabase = await createClient();

  // If the lesson has a quiz block, a passing score is required.
  const { data: quizBlocks } = await supabase
    .from("lesson_blocks")
    .select("id")
    .eq("lesson_id", lessonId)
    .eq("block_type", "quiz");
  if ((quizBlocks ?? []).length > 0) {
    if (quizScore === null || quizScore < QUIZ_PASS_MARK) {
      return { ok: false, error: "Quiz score below pass mark" };
    }
  }

  const boundedScore =
    quizScore === null ? null : Math.max(0, Math.min(100, Math.round(quizScore)));

  await supabase.from("lesson_progress").upsert(
    {
      profile_id: profile.id,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      quiz_score: boundedScore,
    },
    { onConflict: "profile_id,lesson_id" },
  );

  const streak = await updateStreak(profile.id);

  // Track fully complete? Generate the certificate (idempotent).
  let certificateId: string | null = null;
  try {
    const cert = await ensureCertificate(profile.id, context.track.id);
    certificateId = cert?.id ?? null;
  } catch (e) {
    // A cert failure must never block lesson completion.
    console.error("certificate generation failed", e);
  }

  const next = context.siblings.find(
    (s) => s.sort_order > context.lesson.sort_order,
  );

  return {
    ok: true,
    streak,
    nextLessonId: next?.id ?? null,
    trackSlug: context.track.slug,
    certificateId,
  };
}
