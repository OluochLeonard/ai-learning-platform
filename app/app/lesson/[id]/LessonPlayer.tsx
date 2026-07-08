"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type {
  ConceptContent,
  Lesson,
  LessonBlock,
  PracticeContent,
  QuizContent,
  QuizQuestion,
} from "@/types/content";
import { QUIZ_PASS_MARK } from "@/types/content";
import { completeLesson, type CompletionResult } from "./actions";

type Phase =
  | { kind: "block"; blockIndex: number; step: number }
  | { kind: "done"; result: Extract<CompletionResult, { ok: true }> };

function stepsInBlock(block: LessonBlock): number {
  if (block.block_type === "concept" || block.block_type === "example") {
    return (block.content as ConceptContent).screens.length;
  }
  if (block.block_type === "quiz") {
    return (block.content as QuizContent).questions.length;
  }
  return 1; // practice
}

export default function LessonPlayer({
  lesson,
  blocks,
  trackSlug,
  isChild,
}: {
  lesson: Lesson;
  blocks: LessonBlock[];
  trackSlug: string;
  isChild: boolean;
}) {
  const [phase, setPhase] = useState<Phase>({
    kind: "block",
    blockIndex: 0,
    step: 0,
  });
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totalSteps = useMemo(
    () => blocks.reduce((n, b) => n + stepsInBlock(b), 0),
    [blocks],
  );
  const stepsDone = useMemo(() => {
    if (phase.kind === "done") return totalSteps;
    let n = 0;
    for (let i = 0; i < phase.blockIndex; i++) n += stepsInBlock(blocks[i]);
    return n + phase.step;
  }, [phase, blocks, totalSteps]);
  const progressPct = Math.round((stepsDone / totalSteps) * 100);

  function advance() {
    if (phase.kind !== "block") return;
    setError(null);
    const block = blocks[phase.blockIndex];
    if (phase.step + 1 < stepsInBlock(block)) {
      setPhase({ ...phase, step: phase.step + 1 });
      return;
    }
    if (phase.blockIndex + 1 < blocks.length) {
      setPhase({ kind: "block", blockIndex: phase.blockIndex + 1, step: 0 });
      return;
    }
    // Lesson finished: score the quiz (if any) and complete server-side.
    const score = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : null;
    if (quizTotal > 0 && (score ?? 0) < QUIZ_PASS_MARK) {
      // Failed the quiz: send them back to the quiz block to retry.
      const quizIndex = blocks.findIndex((b) => b.block_type === "quiz");
      setQuizCorrect(0);
      setQuizTotal(0);
      setError(
        `You scored ${score}%. You need ${QUIZ_PASS_MARK}% to pass. Give it another go!`,
      );
      setPhase({ kind: "block", blockIndex: quizIndex, step: 0 });
      return;
    }
    startTransition(async () => {
      const result = await completeLesson(lesson.id, score);
      if (result.ok) {
        setPhase({ kind: "done", result });
      } else {
        setError(result.error);
      }
    });
  }

  if (phase.kind === "done") {
    return (
      <CompletionScreen result={phase.result} trackSlug={trackSlug} />
    );
  }

  const block = blocks[phase.blockIndex];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md flex-col px-5 py-4">
      <div className="flex items-center gap-3">
        <Link href={`/app/courses/${trackSlug}`} className="text-zinc-400">
          ✕
        </Link>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${Math.max(progressPct, 3)}%` }}
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      )}

      <div className="flex flex-1 flex-col pt-6">
        {(block.block_type === "concept" || block.block_type === "example") && (
          <ConceptScreen
            content={block.content as ConceptContent}
            step={phase.step}
            onNext={advance}
            pending={pending}
          />
        )}
        {block.block_type === "quiz" && (
          <QuizScreen
            key={`${block.id}-${phase.step}`}
            question={(block.content as QuizContent).questions[phase.step]}
            onAnswered={(correct) => {
              setQuizCorrect((c) => c + (correct ? 1 : 0));
              setQuizTotal((t) => t + 1);
            }}
            onNext={advance}
            pending={pending}
          />
        )}
        {block.block_type === "practice" && (
          <PracticeScreen
            blockId={block.id}
            content={block.content as PracticeContent}
            isChild={isChild}
            onNext={advance}
            pending={pending}
          />
        )}
      </div>
    </div>
  );
}

function ConceptScreen({
  content,
  step,
  onNext,
  pending,
}: {
  content: ConceptContent;
  step: number;
  onNext: () => void;
  pending: boolean;
}) {
  const screen = content.screens[step];
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-800">
          {screen.text}
        </p>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}

function QuizScreen({
  question,
  onAnswered,
  onNext,
  pending,
}: {
  question: QuizQuestion;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
  pending: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | boolean>(null);

  function answerChoice(index: number) {
    if (result !== null) return;
    setPicked(index);
    const correct =
      question.type !== "fill_blank" && index === question.correct;
    setResult(correct);
    onAnswered(correct);
  }

  function answerTyped() {
    if (result !== null || question.type !== "fill_blank") return;
    const normalized = typed.trim().toLowerCase();
    const correct = question.accept.some(
      (a) => a.trim().toLowerCase() === normalized,
    );
    setResult(correct);
    onAnswered(correct);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="text-lg font-semibold leading-snug text-zinc-900">
          {question.question}
        </p>

        {question.type !== "fill_blank" ? (
          <div className="mt-5 space-y-3">
            {question.options.map((opt, i) => {
              let style = "border-zinc-200 bg-white hover:border-indigo-400";
              if (result !== null) {
                if (i === question.correct) {
                  style = "border-green-500 bg-green-50";
                } else if (i === picked) {
                  style = "border-red-400 bg-red-50";
                } else {
                  style = "border-zinc-200 bg-white opacity-60";
                }
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => answerChoice(i)}
                  className={`w-full whitespace-pre-line rounded-xl border px-4 py-3 text-left text-sm font-medium text-zinc-800 ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={result !== null}
              placeholder="Type your answer"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base"
            />
            {result === null && (
              <button
                type="button"
                onClick={answerTyped}
                disabled={!typed.trim()}
                className="mt-3 w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Check
              </button>
            )}
          </div>
        )}

        {result !== null && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              result ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            <p className="font-semibold">
              {result ? "Correct!" : "Not quite."}
            </p>
            <p className="mt-0.5">{question.explanation}</p>
          </div>
        )}
      </div>

      {result !== null && (
        <button
          type="button"
          onClick={onNext}
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Continue"}
        </button>
      )}
    </div>
  );
}

function PracticeScreen({
  blockId,
  content,
  isChild,
  onNext,
  pending,
}: {
  blockId: string;
  content: PracticeContent;
  isChild: boolean;
  onNext: () => void;
  pending: boolean;
}) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<null | {
    feedback: string;
    sample: string;
  }>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const kidsMode = isChild && !!content.template;
  const maxLength = content.max_length ?? (kidsMode ? 80 : 1000);

  async function submit() {
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, input: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Try again.");
      } else {
        setFeedback(data);
      }
    } catch {
      setApiError("Network problem. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <p className="text-lg font-semibold leading-snug text-zinc-900">
          Your turn 💪
        </p>
        <p className="mt-2 whitespace-pre-line text-sm text-zinc-700">
          {content.instructions}
        </p>

        {!feedback && (
          <div className="mt-5">
            {kidsMode ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-sm text-zinc-700">
                  {content.template!.split("___")[0]}
                  <input
                    value={input}
                    onChange={(e) =>
                      setInput(e.target.value.slice(0, maxLength))
                    }
                    placeholder="type here"
                    className="mx-1 inline-block w-40 rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-sm"
                  />
                  {content.template!.split("___")[1] ?? ""}
                </p>
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
                rows={5}
                placeholder="Write your prompt here..."
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base"
              />
            )}
            <p className="mt-1 text-right text-xs text-zinc-400">
              {input.length}/{maxLength}
            </p>
            {apiError && (
              <p className="mt-2 text-sm text-red-600">{apiError}</p>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!input.trim() || submitting}
              className="mt-3 w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? "Getting feedback..." : "Get feedback"}
            </button>
          </div>
        )}

        {feedback && (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Coach feedback
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-indigo-900">
                {feedback.feedback}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Example result
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-zinc-700">
                {feedback.sample}
              </p>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <button
          type="button"
          onClick={onNext}
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Continue"}
        </button>
      )}
    </div>
  );
}

function CompletionScreen({
  result,
  trackSlug,
}: {
  result: Extract<CompletionResult, { ok: true }>;
  trackSlug: string;
}) {
  if (result.certificateId) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
        <div className="text-6xl">🎓</div>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">
          Course complete!
        </h1>
        <p className="mt-2 text-zinc-600">
          You finished every lesson. Your certificate is ready.
        </p>
        <Link
          href={`/app/certificate/${result.certificateId}`}
          className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white hover:bg-indigo-500"
        >
          View my certificate 🎉
        </Link>
        <Link href={`/app/courses/${trackSlug}`} className="mt-3 text-sm text-zinc-500">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <div className="text-6xl">🔥</div>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">
        {result.streak.extendedToday
          ? `${result.streak.current} day streak!`
          : "Lesson complete!"}
      </h1>
      <p className="mt-2 text-zinc-600">
        {result.streak.extendedToday
          ? "You showed up today. That's how skills are built."
          : `Streak already counted today. Current: ${result.streak.current} days.`}
      </p>
      <div className="mt-6 w-full">
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200">
          <div className="h-full w-full animate-pulse rounded-full bg-green-500" />
        </div>
        <p className="mt-1 text-xs text-zinc-500">Lesson 100% complete</p>
      </div>
      {result.nextLessonId ? (
        <Link
          href={`/app/lesson/${result.nextLessonId}`}
          className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white hover:bg-indigo-500"
        >
          Next lesson →
        </Link>
      ) : (
        <Link
          href={`/app/courses/${trackSlug}`}
          className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white hover:bg-indigo-500"
        >
          Back to course
        </Link>
      )}
      <Link href="/app" className="mt-3 text-sm text-zinc-500">
        Home
      </Link>
    </div>
  );
}
