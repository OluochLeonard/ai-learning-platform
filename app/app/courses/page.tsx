import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveProfile } from "@/lib/profile";
import { getTracksForProfile } from "@/lib/lessons";

export const metadata = { title: "Courses" };

export default async function CoursesPage() {
  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const tracks = await getTracksForProfile(profile);

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Courses</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {profile.is_child
          ? "Pick a course and start creating."
          : "Practical AI skills, one short lesson at a time."}
      </p>

      {tracks.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
          <p className="text-3xl">🧑‍🚀</p>
          <p className="mt-2 text-sm font-semibold text-zinc-900">
            New courses are on the way
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Check back soon. Good things are coming.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {tracks.map((track) => (
            <Link
              key={track.id}
              href={`/app/courses/${track.slug}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-indigo-400"
            >
              <h2 className="text-base font-semibold text-zinc-900">
                {track.title}
              </h2>
              {track.description && (
                <p className="mt-1 text-sm text-zinc-600">
                  {track.description}
                </p>
              )}
              <p className="mt-2 text-xs font-medium text-indigo-600">
                Start learning →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
