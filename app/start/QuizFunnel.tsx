"use client";

import { useState, useTransition } from "react";
import { QUIZ_QUESTIONS } from "@/lib/funnel";
import { submitQuiz } from "./actions";

export default function QuizFunnel({
  utmSource,
  utmCampaign,
}: {
  utmSource: string | null;
  utmCampaign: string | null;
}) {
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
      startTransition(() => submitQuiz(next, utmSource, utmCampaign));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-6">
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-zinc-400">
        {Math.min(step + 1, total)} of {total}
      </p>

      {pending ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-2xl">🧠</p>
          <p className="text-lg font-semibold text-zinc-900">
            Building your plan...
          </p>
        </div>
      ) : (
        <>
          <h1 className="mt-8 text-2xl font-bold leading-snug text-zinc-900">
            {current.question}
          </h1>
          <div className="mt-6 space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pick(opt.value)}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-4 text-left text-base font-medium text-zinc-800 transition-colors hover:border-indigo-400 hover:bg-indigo-50 active:bg-indigo-100"
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
