import Link from "next/link";
import { getActiveProfile } from "@/lib/profile";
import { getAccessState } from "@/lib/subscription";
import RenewBanner from "@/components/RenewBanner";

export default async function AppHomePage() {
  const profile = await getActiveProfile();
  const access = await getAccessState();

  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Hey {profile?.display_name ?? "there"} 👋
        </h1>
        <p className="mt-1 text-zinc-400">
          {access.hasAccess
            ? "Ready for today's lesson?"
            : "Let's get you learning."}
        </p>
      </div>

      <RenewBanner access={access} />

      {access.hasAccess ? (
        <Link
          href="/app/courses"
          className="animate-fade-up anim-delay-1 relative block overflow-hidden rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/[0.16] via-violet-500/[0.10] to-transparent p-5 transition-all hover:border-indigo-400/60 hover:shadow-[0_0_36px_rgba(99,102,241,0.25)]"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-500/25 blur-3xl" />
          <p className="relative text-sm font-semibold text-white">
            Jump into today&apos;s lesson ⚡
          </p>
          <p className="relative mt-1 text-sm leading-relaxed text-zinc-400">
            Short, practical lessons. Your access is active until{" "}
            {access.expiresAt?.toLocaleDateString("en-KE", {
              day: "numeric",
              month: "long",
            })}
            .
          </p>
          <span className="relative mt-3 inline-block text-sm font-semibold text-indigo-300">
            Go to courses →
          </span>
        </Link>
      ) : (
        <div className="glass animate-fade-up anim-delay-1 p-5">
          <p className="text-sm font-semibold text-white">
            Unlock all lessons 🔓
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Get full access to every course, practice exercise and
            certificate. Pay easily with M-Pesa.
          </p>
          <Link href="/pricing" className="btn-primary mt-4 px-5 py-2.5">
            See plans
          </Link>
        </div>
      )}
    </div>
  );
}