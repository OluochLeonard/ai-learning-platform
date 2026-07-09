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
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#07070f]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
          <span className="text-lg font-bold tracking-tight text-white">
            PLAT<span className="text-gradient">FORM</span>
          </span>
          <Link
            href="/login"
            className="rounded-lg border border-white/10 px-4 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            Log in
          </Link>
        </div>
      </header>

      <section className="relative mx-auto flex w-full max-w-md flex-col items-center gap-7 px-5 pb-16 pt-14 text-center md:max-w-3xl md:pt-24">
        <div className="chip animate-fade-up">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          The AI skills platform for East Africa
        </div>
        <h1 className="animate-fade-up anim-delay-1 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
          Learn AI.
          <br />
          <span className="text-gradient">Earn more.</span>
        </h1>
        <p className="animate-fade-up anim-delay-2 max-w-sm text-lg leading-relaxed text-zinc-400 md:max-w-xl">
          Master ChatGPT and modern AI tools in 10 minutes a day. Practical
          skills for work, business and side income. Made for Kenya.
        </p>
        <div className="animate-fade-up anim-delay-3 flex w-full flex-col items-center gap-3 md:w-auto">
          <StartCta className="btn-primary w-full px-10 py-4 text-base md:w-auto">
            Find your AI path →
          </StartCta>
          <p className="text-sm text-zinc-500">
            Takes 1 minute. No account needed to start.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 pb-4 md:max-w-3xl">
        <div className="glass animate-fade-up anim-delay-4 grid grid-cols-3 divide-x divide-white/[0.06] py-5 text-center">
          <div>
            <p className="text-2xl font-bold text-white">7 min</p>
            <p className="mt-0.5 text-xs text-zinc-500">average lesson</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="mt-0.5 text-xs text-zinc-500">on your phone</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">M-Pesa</p>
            <p className="mt-0.5 text-xs text-zinc-500">easy payment</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 py-12 md:max-w-3xl">
        <h2 className="text-center text-xl font-semibold text-white">
          How it works
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: "🎯",
              title: "Get your path",
              body: "A 1-minute quiz matches you to the right course for your goals.",
            },
            {
              icon: "⚡",
              title: "Learn in minutes",
              body: "Short daily lessons with real AI practice, not boring theory.",
            },
            {
              icon: "🎓",
              title: "Earn your certificate",
              body: "Finish a course, get a verified certificate, share it anywhere.",
            },
          ].map((item) => (
            <div key={item.title} className="glass glass-hover p-5">
              <p className="text-2xl">{item.icon}</p>
              <p className="mt-3 text-sm font-semibold text-white">
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 pb-12 md:max-w-3xl">
        <h2 className="text-center text-xl font-semibold text-white">
          Why learners stick with us
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <figure className="glass p-5">
            <p className="text-sm leading-relaxed text-zinc-300">
              &quot;I wrote my first client proposal with AI in week one. It
              felt like a superpower.&quot;
            </p>
            <figcaption className="mt-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                F
              </span>
              <span className="text-xs font-medium text-zinc-500">
                Faith, Nairobi
              </span>
            </figcaption>
          </figure>
          <figure className="glass p-5">
            <p className="text-sm leading-relaxed text-zinc-300">
              &quot;Short lessons that fit into my matatu ride. I actually
              finish them.&quot;
            </p>
            <figcaption className="mt-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 text-xs font-bold text-white">
                B
              </span>
              <span className="text-xs font-medium text-zinc-500">
                Brian, Mombasa
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md px-5 pb-16 md:max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-cyan-500/10 p-7 text-center">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
          <h2 className="relative text-xl font-semibold text-white">
            Got kids at home? 🚀
          </h2>
          <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-300">
            Our Holiday AI Camp gets ages 8 to 17 creating with AI, safely and
            with you in control.
          </p>
          <Link
            href="/kids"
            className="btn-ghost relative mt-5 border-white/25 bg-white/10 hover:bg-white/[0.15]"
          >
            See the kids camp
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-8 text-center">
        <p className="text-sm font-semibold tracking-tight text-zinc-400">
          PLAT<span className="text-gradient">FORM</span>
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Learn AI skills that pay. Made for Kenya.
        </p>
      </footer>
    </div>
  );
}