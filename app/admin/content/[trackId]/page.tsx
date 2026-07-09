import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createLesson,
  createModule,
  toggleLessonPublished,
  updateTrack,
} from "../../actions";

export default async function AdminTrackPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  await requireAdmin();
  const { trackId } = await params;
  const admin = createAdminClient();

  const { data: track } = await admin
    .from("tracks")
    .select("*")
    .eq("id", trackId)
    .single();
  if (!track) redirect("/admin/content");

  const { data: modules } = await admin
    .from("modules")
    .select("*, lessons(*)")
    .eq("track_id", trackId)
    .order("sort_order", { ascending: true });

  const saveTrack = updateTrack.bind(null, track.id);
  const addModule = createModule.bind(null, track.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/content" className="text-sm text-zinc-500">
          ← Tracks
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-zinc-900">
          {track.title}
        </h1>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-semibold text-zinc-900">Track settings</p>
        <form action={saveTrack} className="mt-3 grid grid-cols-2 gap-3">
          <input
            name="title"
            defaultValue={track.title}
            required
            className="col-span-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="slug"
            defaultValue={track.slug}
            required
            pattern="[a-z0-9-]+"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="sort_order"
            type="number"
            defaultValue={track.sort_order}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            name="audience"
            defaultValue={track.audience}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="adult">Adult</option>
            <option value="kids">Kids</option>
          </select>
          <select
            name="age_band"
            defaultValue={track.age_band ?? "8-12"}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="8-12">8-12 (kids only)</option>
            <option value="13-17">13-17 (kids only)</option>
          </select>
          <textarea
            name="description"
            defaultValue={track.description ?? ""}
            rows={2}
            className="col-span-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Save settings
          </button>
        </form>
      </div>

      {(modules ?? []).map((module) => {
        const addLesson = createLesson.bind(null, track.id, module.id);
        const lessons = [...(module.lessons ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        return (
          <div
            key={module.id}
            className="rounded-xl border border-zinc-200 bg-white"
          >
            <p className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">
              Module: {module.title}
            </p>
            <ul className="divide-y divide-zinc-100">
              {lessons.map((lesson) => {
                const toggle = toggleLessonPublished.bind(
                  null,
                  lesson.id,
                  track.id,
                  !lesson.is_published,
                );
                return (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <Link
                      href={`/admin/lesson/${lesson.id}`}
                      className="min-w-0 flex-1 text-sm font-medium text-zinc-900 hover:text-indigo-600"
                    >
                      {lesson.title}
                      <span className="ml-2 text-xs font-normal text-zinc-400">
                        {lesson.estimated_minutes} min
                      </span>
                    </Link>
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
                  </li>
                );
              })}
            </ul>
            <form
              action={addLesson}
              className="flex gap-2 border-t border-zinc-100 px-4 py-3"
            >
              <input
                name="title"
                required
                placeholder="New lesson title"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                name="estimated_minutes"
                type="number"
                defaultValue={7}
                className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Add
              </button>
            </form>
          </div>
        );
      })}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-semibold text-zinc-900">New module</p>
        <form action={addModule} className="mt-3 flex gap-2">
          <input
            name="title"
            required
            placeholder="Module title"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Add module
          </button>
        </form>
      </div>
    </div>
  );
}