import Link from "next/link";
import type { Metadata } from "next";
import StartCta from "@/components/StartCta";

export const metadata: Metadata = {
  title: "PLATFORM: Learn AI. Earn more.",
  description:
    "Master ChatGPT and modern AI tools in 10 minutes a day. Practical skills for work, business and side income. Pay with M-Pesa. Made for Kenya.",
};

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <span className="text-lg font-bold text-zinc-900">PLATFORM</span>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Log in
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-5 pb-12 pt-10 text-center md:max-w-2xl md:pt-20">
        <h1 className="text-4xl font-bold leading-tight text-zinc-900 md:text-5xl">
          Learn AI. <span className="text-indigo-600">Earn more.</span>
        </h1>
        <p className="max-w-sm text-lg text-zinc-600 md:max-w-lg">
          Master ChatGPT and modern AI tools in 10 minutes a day. Practical
          skills for work, business and side income. Made for Kenya.
        </p>
        <StartCta className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 md:w-auto md:px-10">
          Find your AI path
        </StartCta>
        <p className="text-sm text-zinc-500">
          Takes 1 minute. No account needed to start.
        </p>
      </section>

      <section className="bg-zinc-50 px-5 py-10">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-4 text-center md:max-w-2xl">
          <div>
            <p className="text-2xl font-bold text-zinc-900">7 min</p>
            <p className="text-xs text-zinc-500">average lesson</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">100%</p>
            <p className="text-xs text-zinc-500">on your phone</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">KES</p>
            <p className="text-xs text-zinc-500">pay with M-Pesa</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 py-10 md:max-w-2xl">
        <h2 className="text-center text-xl font-semibold text-zinc-900">
          Why learners stick with us
        </h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-700">
              &quot;I wrote my first client proposal with AI in week one. It
              felt like a superpower.&quot;
            </p>
            <p className="mt-2 text-xs font-medium text-zinc-500">
              Faith, Nairobi
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-700">
              &quot;Short lessons that fit into my matatu ride. I actually
              finish them.&quot;
            </p>
            <p className="mt-2 text-xs font-medium text-zinc-500">
              Brian, Mombasa
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 pb-14 text-center md:max-w-2xl">
        <div className="rounded-2xl bg-indigo-600 px-6 py-8 text-white">
          <h2 className="text-xl font-semibold">Got kids at home?</h2>
          <p className="mt-2 text-sm text-indigo-100">
            Our Holiday AI Camp gets ages 8 to 17 creating with AI, safely and
            with you in control.
          </p>
          <Link
            href="/kids"
            className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            See the kids camp
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-200 px-5 py-6 text-center text-xs text-zinc-400">
        PLATFORM. Learn AI skills that pay.
      </footer>
    </div>
  );
}
