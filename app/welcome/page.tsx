import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccessState } from "@/lib/subscription";

export const metadata = { title: "Welcome aboard" };

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await getAccessState();
  if (!access.hasAccess) redirect("/pricing");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10 text-center">
      <div className="animate-fade-up relative">
        <div className="text-6xl">🎉</div>
        <span className="absolute -inset-6 -z-10 rounded-full bg-violet-500/25 blur-3xl" />
      </div>
      <h1 className="animate-fade-up anim-delay-1 mt-5 text-3xl font-bold tracking-tight text-white">
        You&apos;re in!
      </h1>
      <p className="animate-fade-up anim-delay-2 mt-2 leading-relaxed text-zinc-400">
        Payment received. Your access is active until{" "}
        <span className="font-semibold text-white">
          {access.expiresAt?.toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        .
      </p>
      <div className="animate-fade-up anim-delay-3 mt-7 w-full space-y-3 text-left">
        <div className="glass glass-hover flex items-start gap-3 p-4">
          <span className="text-xl">⚡</span>
          <span>
            <span className="block text-sm font-semibold text-white">
              1. Start your first lesson
            </span>
            <span className="mt-0.5 block text-sm text-zinc-400">
              Just 7 minutes. You will use AI before it ends.
            </span>
          </span>
        </div>
        <div className="glass glass-hover flex items-start gap-3 p-4">
          <span className="text-xl">🔥</span>
          <span>
            <span className="block text-sm font-semibold text-white">
              2. Come back tomorrow
            </span>
            <span className="mt-0.5 block text-sm text-zinc-400">
              Daily streaks keep you moving. Small steps, big skills.
            </span>
          </span>
        </div>
        {(access.plan?.max_child_profiles ?? 0) > 0 && (
          <div className="glass glass-hover flex items-start gap-3 p-4">
            <span className="text-xl">👨‍👩‍👧</span>
            <span>
              <span className="block text-sm font-semibold text-white">
                3. Add your kids
              </span>
              <span className="mt-0.5 block text-sm text-zinc-400">
                Your plan includes child profiles. Set them up from your
                account page.
              </span>
            </span>
          </div>
        )}
      </div>
      <Link
        href="/app"
        className="btn-primary animate-fade-up anim-delay-4 mt-8 w-full py-4 text-base"
      >
        Go to my dashboard →
      </Link>
    </div>
  );
}