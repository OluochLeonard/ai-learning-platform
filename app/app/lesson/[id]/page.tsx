import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/profile";
import { getLessonContext, hasActiveAccess } from "@/lib/lessons";
import LessonPlayer from "./LessonPlayer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const context = await getLessonContext(id);
  if (!context) redirect("/app/courses");
  const { lesson, track, siblings } = context;

  // Audience guard mirrors the catalog rules.
  if (profile.is_child) {
    if (track.audience !== "kids" || track.age_band !== profile.age_band) {
      redirect("/app/courses");
    }
  } else if (track.audience !== "adult") {
    redirect("/app/courses");
  }

  // Content is paid: no active subscription, no blocks. Server-side.
  const access = await hasActiveAccess(profile.id);
  if (!access) redirect("/pricing");

  const supabase = await createClient();

  // Enforce sequential unlock server-side: every earlier sibling in the
  // module must be completed.
  const earlier = siblings.filter((s) => s.sort_order < lesson.sort_order);
  if (earlier.length > 0) {
    const { data: done } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("profile_id", profile.id)
      .not("completed_at", "is", null)
      .in(
        "lesson_id",
        earlier.map((s) => s.id),
      );
    if ((done ?? []).length < earlier.length) {
      redirect(`/app/courses/${track.slug}`);
    }
  }

  const { data: blocks } = await supabase
    .from("lesson_blocks")
    .select("*")
    .eq("lesson_id", lesson.id)
    .order("sort_order", { ascending: true });

  if (!blocks || blocks.length === 0) redirect(`/app/courses/${track.slug}`);

  // Mark started (idempotent thanks to the unique constraint).
  await supabase
    .from("lesson_progress")
    .upsert(
      { profile_id: profile.id, lesson_id: lesson.id },
      { onConflict: "profile_id,lesson_id", ignoreDuplicates: true },
    );

  return (
    <LessonPlayer
      lesson={lesson}
      blocks={blocks}
      trackSlug={track.slug}
      isChild={profile.is_child}
    />
  );
}
