"use client";

import { useState, useTransition } from "react";
import type {
  ConceptContent,
  LessonBlock,
  PracticeContent,
  QuizContent,
  QuizQuestion,
} from "@/types/content";
import { saveBlock } from "../../actions";

type BlockType = LessonBlock["block_type"];

const EMPTY_CONTENT: Record<BlockType, unknown> = {
  concept: { screens: [{ text: "" }] },
  example: { screens: [{ text: "" }] },
  quiz: {
    questions: [
      { type: "mcq", question: "", options: ["", ""], correct: 0, explanation: "" },
    ],
  },
  practice: {
    instructions: "",
    task_context: "",
    system_prompt: "",
    max_length: 600,
  },
};

export default function BlockEditor({
  lessonId,
  block,
  onClose,
  newType,
}: {
  lessonId: string;
  block: LessonBlock | null; // null = creating
  newType?: BlockType;
  onClose: () => void;
}) {
  const type: BlockType = block?.block_type ?? newType ?? "concept";
  const [content] = useState<unknown>(block?.content ?? EMPTY_CONTENT[type]);
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(finalContent: unknown) {
    setError(null);
    startTransition(async () => {
      const result = await saveBlock(
        lessonId,
        block?.id ?? null,
        type,
        finalContent,
      );
      if (result.ok) onClose();
      else setError(result.error ?? "Save failed");
    });
  }

  function saveRaw() {
    try {
      save(JSON.parse(rawText));
    } catch {
      setError("Invalid JSON");
    }
  }

  return (
    <div className="rounded-xl border-2 border-indigo-300 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">
          {block ? "Edit" : "New"} {type} block
        </p>
        <button
          type="button"
          onClick={() => {
            if (!rawMode) setRawText(JSON.stringify(content, null, 2));
            setRawMode(!rawMode);
          }}
          className="text-xs font-medium text-indigo-600"
        >
          {rawMode ? "Back to form" : "Edit as JSON"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {rawMode ? (
        <div className="mt-3">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={14}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={saveRaw}
              disabled={pending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving..." : "Save JSON"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : type === "concept" || type === "example" ? (
        <ScreensForm
          content={content as ConceptContent}
          onSave={save}
          onCancel={onClose}
          pending={pending}
        />
      ) : type === "practice" ? (
        <PracticeForm
          content={content as PracticeContent}
          onSave={save}
          onCancel={onClose}
          pending={pending}
        />
      ) : (
        <QuizForm
          content={content as QuizContent}
          onSave={save}
          onCancel={onClose}
          pending={pending}
        />
      )}
    </div>
  );
}

function ScreensForm({
  content,
  onSave,
  onCancel,
  pending,
}: {
  content: ConceptContent;
  onSave: (c: unknown) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [screens, setScreens] = useState(
    content.screens.map((s) => s.text),
  );
  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-zinc-500">
        One card per screen. Learners tap through them one at a time.
      </p>
      {screens.map((text, i) => (
        <div key={i} className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) =>
              setScreens(screens.map((s, j) => (j === i ? e.target.value : s)))
            }
            rows={3}
            placeholder={`Screen ${i + 1} text`}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setScreens(screens.filter((_, j) => j !== i))}
            disabled={screens.length === 1}
            className="self-start rounded-lg border border-zinc-200 px-2 py-1 text-xs text-red-500 disabled:opacity-30"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setScreens([...screens, ""])}
        className="text-xs font-medium text-indigo-600"
      >
        + Add screen
      </button>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending || screens.some((s) => !s.trim())}
          onClick={() => onSave({ screens: screens.map((text) => ({ text })) })}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save block"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

function PracticeForm({
  content,
  onSave,
  onCancel,
  pending,
}: {
  content: PracticeContent;
  onSave: (c: unknown) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [form, setForm] = useState({
    instructions: content.instructions ?? "",
    task_context: content.task_context ?? "",
    system_prompt: content.system_prompt ?? "",
    template: content.template ?? "",
    max_length: content.max_length ?? 600,
    kid_safe: content.kid_safe ?? false,
  });
  const set = (k: string, v: unknown) => setForm({ ...form, [k]: v });

  return (
    <div className="mt-3 space-y-3">
      <label className="block text-xs font-medium text-zinc-600">
        Instructions shown to the learner
        <textarea
          value={form.instructions}
          onChange={(e) => set("instructions", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
        />
      </label>
      <label className="block text-xs font-medium text-zinc-600">
        Task context (given to the AI coach, not shown to learner)
        <textarea
          value={form.task_context}
          onChange={(e) => set("task_context", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
        />
      </label>
      <label className="block text-xs font-medium text-zinc-600">
        System prompt for the AI coach
        <textarea
          value={form.system_prompt}
          onChange={(e) => set("system_prompt", e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
        />
      </label>
      <label className="block text-xs font-medium text-zinc-600">
        Kids template (must contain ___ where the child types; required for
        kids lessons)
        <input
          value={form.template}
          onChange={(e) => set("template", e.target.value)}
          placeholder="Write a story about ___ who..."
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
        />
      </label>
      <div className="flex items-center gap-4">
        <label className="text-xs font-medium text-zinc-600">
          Max input length
          <input
            type="number"
            value={form.max_length}
            onChange={(e) => set("max_length", Number(e.target.value))}
            className="ml-2 w-24 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-normal"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
          <input
            type="checkbox"
            checked={form.kid_safe}
            onChange={(e) => set("kid_safe", e.target.checked)}
          />
          Kid safe
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={
            pending ||
            !form.instructions.trim() ||
            !form.task_context.trim() ||
            !form.system_prompt.trim()
          }
          onClick={() =>
            onSave({
              instructions: form.instructions,
              task_context: form.task_context,
              system_prompt: form.system_prompt,
              ...(form.template.trim() ? { template: form.template } : {}),
              max_length: form.max_length,
              ...(form.kid_safe ? { kid_safe: true } : {}),
            })
          }
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save block"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

function QuizForm({
  content,
  onSave,
  onCancel,
  pending,
}: {
  content: QuizContent;
  onSave: (c: unknown) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    content.questions ?? [],
  );

  const update = (i: number, q: QuizQuestion) =>
    setQuestions(questions.map((old, j) => (j === i ? q : old)));

  const valid = questions.every((q) =>
    q.type === "fill_blank"
      ? q.question.trim() && q.accept.length > 0 && q.explanation.trim()
      : q.question.trim() &&
        q.options.filter((o) => o.trim()).length >= 2 &&
        q.explanation.trim(),
  );

  return (
    <div className="mt-3 space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="rounded-lg border border-zinc-200 p-3">
          <div className="flex items-center justify-between">
            <select
              value={q.type}
              onChange={(e) => {
                const t = e.target.value as QuizQuestion["type"];
                update(
                  i,
                  t === "fill_blank"
                    ? { type: t, question: q.question, accept: [], explanation: q.explanation }
                    : { type: t, question: q.question, options: ["", ""], correct: 0, explanation: q.explanation },
                );
              }}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-xs"
            >
              <option value="mcq">Multiple choice</option>
              <option value="prompt_pick">Which prompt is better</option>
              <option value="fill_blank">Fill in the blank</option>
            </select>
            <button
              type="button"
              onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
              className="text-xs text-red-500"
            >
              Remove
            </button>
          </div>
          <textarea
            value={q.question}
            onChange={(e) => update(i, { ...q, question: e.target.value })}
            rows={2}
            placeholder="Question"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          {q.type === "fill_blank" ? (
            <input
              value={q.accept.join(", ")}
              onChange={(e) =>
                update(i, {
                  ...q,
                  accept: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Accepted answers, comma separated"
              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          ) : (
            <div className="mt-2 space-y-1.5">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={q.correct === oi}
                    onChange={() => update(i, { ...q, correct: oi })}
                    title="Correct answer"
                  />
                  <input
                    value={opt}
                    onChange={(e) =>
                      update(i, {
                        ...q,
                        options: q.options.map((o, j) =>
                          j === oi ? e.target.value : o,
                        ),
                      })
                    }
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(i, {
                        ...q,
                        options: q.options.filter((_, j) => j !== oi),
                        correct: q.correct >= oi && q.correct > 0 ? q.correct - 1 : q.correct,
                      })
                    }
                    disabled={q.options.length <= 2}
                    className="text-xs text-red-400 disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update(i, { ...q, options: [...q.options, ""] })}
                className="text-xs font-medium text-indigo-600"
              >
                + Option
              </button>
              <p className="text-[10px] text-zinc-400">
                Radio marks the correct answer.
              </p>
            </div>
          )}
          <input
            value={q.explanation}
            onChange={(e) => update(i, { ...q, explanation: e.target.value })}
            placeholder="One-line explanation shown after answering"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setQuestions([
            ...questions,
            { type: "mcq", question: "", options: ["", ""], correct: 0, explanation: "" },
          ])
        }
        className="text-xs font-medium text-indigo-600"
      >
        + Add question
      </button>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending || questions.length === 0 || !valid}
          onClick={() => onSave({ questions })}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save block"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}