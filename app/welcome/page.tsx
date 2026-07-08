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
      <div className="text-5xl">🎉</div>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">
        You&apos;re in!
      </h1>
      <p className="mt-2 text-zinc-600">
        Payment received. Your access is active until{" "}
        <span className="font-semibold text-zinc-900">
          {access.expiresAt?.toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        .
      </p>
      <div className="mt-6 w-full space-y-3 text-left">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-semibold text-zinc-900">
            1. Start your first lesson
          </p>
          <p className="mt-0.5 text-sm text-zinc-600">
            Just 7 minutes. You will use AI before it ends.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-semibold text-zinc-900">
            2. Come back tomorrow
          </p>
          <p className="mt-0.5 text-sm text-zinc-600">
            Daily streaks keep you moving. Small steps, big skills.
          </p>
        </div>
        {(access.plan?.max_child_profiles ?? 0) > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-semibold text-zinc-900">
              3. Add your kids
            </p>
            <p className="mt-0.5 text-sm text-zinc-600">
              Your plan includes child profiles. Set them up from your
              account page.
            </p>
          </div>
        )}
      </div>
      <Link
        href="/app"
        className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white hover:bg-indigo-500"
      >
        Go to my dashboard
      </Link>
    </div>
  );
}
