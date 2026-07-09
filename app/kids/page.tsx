import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holiday AI Camp for Kids",
  description:
    "3 weeks of fun, guided AI lessons for ages 8 to 17. Safe, structured and fully managed from your parent account. Pay once with M-Pesa.",
};

export default function KidsLandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#07070f]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-white">
            PLAT<span className="text-gradient">FORM</span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/10 px-4 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            Log in
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-5 pb-14 pt-12 text-center md:max-w-3xl md:pt-20">
        <span className="chip animate-fade-up border-amber-400/20 bg-amber-400/10 text-amber-200">
          ☀️ Holiday AI Camp
        </span>
        <h1 className="animate-fade-up anim-delay-1 text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl">
          This holiday, your child learns{" "}
          <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
            the skill of the decade
          </span>
        </h1>
        <p className="animate-fade-up anim-delay-2 max-w-sm text-lg leading-relaxed text-zinc-400 md:max-w-xl">
          3 weeks of fun, guided AI lessons for ages 8 to 17. Safe, structured
          and fully managed from your account.
        </p>
        <div className="animate-fade-up anim-delay-3 flex w-full flex-col items-center gap-3 md:w-auto">
          <Link
            href="/checkout/kids-holiday-camp"
            className="btn-primary w-full px-10 py-4 text-base md:w-auto"
          >
            Enroll for the camp →
          </Link>
          <p className="text-sm text-zinc-500">
            One payment. Up to 3 children. No auto-renewal.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 pb-12 md:max-w-3xl">
        <h2 className="text-center text-xl font-semibold text-white">
          Built for parents, loved by kids
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="glass glass-hover p-5">
            <p className="text-2xl">🛡️</p>
            <p className="mt-3 text-sm font-semibold text-white">
              Safe by design
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              No open chat. Kids practice with guided, pre-set activities only.
              You create and control their profiles.
            </p>
          </div>
          <div className="glass glass-hover p-5">
            <p className="text-2xl">🎯</p>
            <p className="mt-3 text-sm font-semibold text-white">
              Age-appropriate tracks
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Separate lessons for ages 8 to 12 and 13 to 17, from AI basics to
              creating their first projects.
            </p>
          </div>
          <div className="glass glass-hover p-5">
            <p className="text-2xl">📊</p>
            <p className="mt-3 text-sm font-semibold text-white">
              You see everything
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Follow each child&apos;s progress, streaks and completed lessons
              from your parent dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 pb-16 text-center md:max-w-3xl">
        <p className="text-sm text-zinc-500">
          Learning for yourself instead?{" "}
          <Link
            href="/start"
            className="font-medium text-indigo-300 transition-colors hover:text-indigo-200"
          >
            Take the 1-minute quiz
          </Link>
        </p>
      </section>
    </div>
  );
}