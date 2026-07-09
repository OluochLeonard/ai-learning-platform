import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTrack, toggleTrackPublished } from "../actions";

export default async function AdminContentPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: tracks } = await admin
    .from("tracks")
    .select("*")
    .order("audience", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Content</h1>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <p className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">
          Tracks
        </p>
        <ul className="divide-y divide-zinc-100">
          {(tracks ?? []).map((track) => {
            const toggle = toggleTrackPublished.bind(
              null,
              track.id,
              !track.is_published,
            );
            return (
              <li
                key={track.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <Link
                  href={`/admin/content/${track.id}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-medium text-zinc-900 hover:text-indigo-600">
                    {track.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {track.audience}
                    {track.age_band ? ` · ${track.age_band}` : ""} ·{" "}
                    {track.slug}
                  </p>
                </Link>
                <form action={toggle}>
                  <button
                    type="submit"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      track.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {track.is_published ? "Published" : "Draft"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-semibold text-zinc-900">New track</p>
        <form action={createTrack} className="mt-3 grid grid-cols-2 gap-3">
          <input
            name="title"
            required
            placeholder="Title"
            className="col-span-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="slug"
            required
            placeholder="slug-like-this"
            pattern="[a-z0-9-]+"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            name="audience"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="adult">Adult</option>
            <option value="kids">Kids</option>
          </select>
          <select
            name="age_band"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="8-12">8-12 (kids only)</option>
            <option value="13-17">13-17 (kids only)</option>
          </select>
          <textarea
            name="description"
            placeholder="Short description"
            rows={2}
            className="col-span-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Create track
          </button>
        </form>
      </div>
    </div>
  );
}