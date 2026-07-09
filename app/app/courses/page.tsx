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
      <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-white">
        Courses
      </h1>
      <p className="animate-fade-up anim-delay-1 mt-1 text-sm text-zinc-500">
        {profile.is_child
          ? "Pick a course and start creating."
          : "Practical AI skills, one short lesson at a time."}
      </p>

      {tracks.length === 0 ? (
        <div className="glass animate-fade-up anim-delay-2 mt-8 p-8 text-center">
          <p className="text-4xl">🧑‍🚀</p>
          <p className="mt-3 text-sm font-semibold text-white">
            New courses are on the way
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Check back soon. Good things are coming.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {tracks.map((track, i) => (
            <Link
              key={track.id}
              href={`/app/courses/${track.slug}`}
              className={`glass glass-hover animate-fade-up anim-delay-${Math.min(i + 2, 4)} relative block overflow-hidden p-5`}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/15 blur-2xl" />
              <h2 className="relative text-base font-semibold text-white">
                {track.title}
              </h2>
              {track.description && (
                <p className="relative mt-1 text-sm leading-relaxed text-zinc-400">
                  {track.description}
                </p>
              )}
              <p className="relative mt-3 text-xs font-semibold text-indigo-300">
                Start learning →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}