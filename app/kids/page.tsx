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
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-bold text-zinc-900">
          PLATFORM
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Log in
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-5 pb-12 pt-10 text-center md:max-w-2xl md:pt-16">
        <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
          Holiday AI Camp
        </span>
        <h1 className="text-3xl font-bold leading-tight text-zinc-900 md:text-4xl">
          This holiday, your child learns the skill of the decade
        </h1>
        <p className="max-w-sm text-lg text-zinc-600 md:max-w-lg">
          3 weeks of fun, guided AI lessons for ages 8 to 17. Safe, structured
          and fully managed from your account.
        </p>
        <Link
          href="/checkout/kids-holiday-camp"
          className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 md:w-auto md:px-10"
        >
          Enroll for the camp
        </Link>
        <p className="text-sm text-zinc-500">
          One payment. Up to 3 children. No auto-renewal.
        </p>
      </section>

      <section className="bg-zinc-50 px-5 py-10">
        <div className="mx-auto max-w-md space-y-4 md:max-w-2xl">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            Built for parents, loved by kids
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-semibold text-zinc-900">
              🛡️ Safe by design
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              No open chat. Kids practice with guided, pre-set activities only.
              You create and control their profiles.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-semibold text-zinc-900">
              🎯 Age-appropriate tracks
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Separate lessons for ages 8 to 12 and 13 to 17, from AI basics to
              creating their first projects.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-semibold text-zinc-900">
              📊 You see everything
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Follow each child&apos;s progress, streaks and completed lessons
              from your parent dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 py-10 text-center md:max-w-2xl">
        <p className="text-sm text-zinc-500">
          Learning for yourself instead?{" "}
          <Link href="/start" className="font-medium text-indigo-600">
            Take the 1-minute quiz
          </Link>
        </p>
      </section>
    </div>
  );
}
