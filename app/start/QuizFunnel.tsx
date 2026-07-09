"use client";

import { useState, useTransition } from "react";
import { QUIZ_QUESTIONS } from "@/lib/funnel";
import { submitQuiz } from "./actions";

export default function QuizFunnel() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const total = QUIZ_QUESTIONS.length;
  const current = QUIZ_QUESTIONS[Math.min(step, total - 1)];
  const progress = Math.round((step / total) * 100);

  function pick(value: string) {
    if (pending) return;
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      const params = new URLSearchParams(window.location.search);
      startTransition(() =>
        submitQuiz(
          next,
          params.get("utm_source"),
          params.get("utm_campaign"),
        ),
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-6">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-all duration-300"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-zinc-500">
        {Math.min(step + 1, total)} of {total}
      </p>

      {pending ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="relative">
            <p className="text-4xl">🧠</p>
            <span className="absolute -inset-4 -z-10 animate-pulse rounded-full bg-indigo-500/25 blur-2xl" />
          </div>
          <p className="text-lg font-semibold text-white">
            Building your plan...
          </p>
        </div>
      ) : (
        <>
          <h1
            key={current.key}
            className="animate-fade-up mt-9 text-2xl font-bold leading-snug tracking-tight text-white"
          >
            {current.question}
          </h1>
          <div className="mt-6 space-y-3">
            {current.options.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pick(opt.value)}
                className={`glass glass-hover animate-fade-up anim-delay-${Math.min(i + 1, 4)} flex w-full items-center gap-3 px-4 py-4 text-left text-base font-medium text-zinc-100 active:scale-[0.98]`}
              >
                {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}