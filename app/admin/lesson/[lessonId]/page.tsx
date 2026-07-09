import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { toggleLessonPublished } from "../../actions";
import BlockList from "./BlockList";

export default async function AdminLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  await requireAdmin();
  const { lessonId } = await params;
  const admin = createAdminClient();

  const { data: lesson } = await admin
    .from("lessons")
    .select("*, modules(track_id, tracks(title))")
    .eq("id", lessonId)
    .single();
  if (!lesson) redirect("/admin/content");

  const trackId = lesson.modules.track_id;
  const { data: blocks } = await admin
    .from("lesson_blocks")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  const toggle = toggleLessonPublished.bind(
    null,
    lesson.id,
    trackId,
    !lesson.is_published,
  );

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/admin/content/${trackId}`} className="text-sm text-zinc-500">
          ← {lesson.modules.tracks.title}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">
            {lesson.title}
          </h1>
          <form action={toggle}>
            <button
              type="submit"
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                lesson.is_published
                  ? "bg-green-100 text-green-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {lesson.is_published ? "Published" : "Draft"}
            </button>
          </form>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Blocks render top to bottom, one screen at a time. Learners need 60%
          on the quiz to complete the lesson.
        </p>
      </div>

      <BlockList lessonId={lessonId} blocks={blocks ?? []} />
    </div>
  );
}