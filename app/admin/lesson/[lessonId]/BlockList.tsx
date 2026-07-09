"use client";

import { useState, useTransition } from "react";
import type { LessonBlock } from "@/types/content";
import { deleteBlock, moveBlock } from "../../actions";
import BlockEditor from "./BlockEditor";

function blockSummary(block: LessonBlock): string {
  if (block.block_type === "concept" || block.block_type === "example") {
    const c = block.content as { screens?: { text: string }[] };
    return `${c.screens?.length ?? 0} screens`;
  }
  if (block.block_type === "quiz") {
    const c = block.content as { questions?: unknown[] };
    return `${c.questions?.length ?? 0} questions`;
  }
  const c = block.content as { template?: string };
  return c.template ? "guided template" : "free prompt";
}

export default function BlockList({
  lessonId,
  blocks,
}: {
  lessonId: string;
  blocks: LessonBlock[];
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState<LessonBlock["block_type"] | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={block.id}>
          {editing === block.id ? (
            <BlockEditor
              lessonId={lessonId}
              block={block}
              onClose={() => setEditing(null)}
            />
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase text-zinc-600">
                {block.block_type}
              </span>
              <span className="flex-1 truncate text-sm text-zinc-600">
                {blockSummary(block)}
              </span>
              <button
                type="button"
                disabled={pending || i === 0}
                onClick={() =>
                  startTransition(() => moveBlock(lessonId, block.id, "up"))
                }
                className="px-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={pending || i === blocks.length - 1}
                onClick={() =>
                  startTransition(() => moveBlock(lessonId, block.id, "down"))
                }
                className="px-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => setEditing(block.id)}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (confirm("Delete this block?")) {
                    startTransition(() => deleteBlock(lessonId, block.id));
                  }
                }}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}

      {creating ? (
        <BlockEditor
          lessonId={lessonId}
          block={null}
          newType={creating}
          onClose={() => setCreating(null)}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {(["concept", "example", "practice", "quiz"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCreating(t)}
              className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 hover:border-indigo-400 hover:text-indigo-600"
            >
              + {t} block
            </button>
          ))}
        </div>
      )}
    </div>
  );
}