import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/profile";
import { hasActiveAccess } from "@/lib/lessons";
import type { PracticeContent } from "@/types/content";

const ADULT_MAX_INPUT = 1000;
const KIDS_MAX_INPUT = 80;

type FeedbackPayload = { feedback: string; sample: string };

export async function POST(request: NextRequest) {
  let body: { blockId?: string; input?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const blockId = String(body.blockId ?? "");
  const rawInput = String(body.input ?? "").trim();
  if (!blockId || !rawInput) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }

  const profile = await getActiveProfile();
  if (!profile) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!(await hasActiveAccess(profile.id))) {
    return NextResponse.json({ error: "No active plan" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: block } = await supabase
    .from("lesson_blocks")
    .select("*, lessons(id, is_published, modules(tracks(audience, age_band)))")
    .eq("id", blockId)
    .eq("block_type", "practice")
    .single();

  const track = block?.lessons?.modules?.tracks;
  if (!block || !block.lessons?.is_published || !track) {
    return NextResponse.json({ error: "Practice not found" }, { status: 404 });
  }

  const content = block.content as PracticeContent;

  // KIDS SAFETY: enforced by the track's audience, never by what the
  // client sends. Kids practice is a guided fill-in: short input spliced
  // into the block's fixed template, run under the block's tight system
  // prompt. No free-form chat.
  const isKidsLesson = track.audience === "kids";
  let userInput = rawInput;
  if (isKidsLesson) {
    const maxLen = Math.min(content.max_length ?? KIDS_MAX_INPUT, KIDS_MAX_INPUT);
    if (rawInput.length > maxLen) {
      return NextResponse.json(
        { error: `Keep it under ${maxLen} characters` },
        { status: 400 },
      );
    }
    if (!content.template || !content.template.includes("___")) {
      return NextResponse.json(
        { error: "This activity is not available" },
        { status: 400 },
      );
    }
    userInput = content.template.replace("___", rawInput);
  } else {
    if (rawInput.length > (content.max_length ?? ADULT_MAX_INPUT)) {
      return NextResponse.json({ error: "Too long" }, { status: 400 });
    }
  }

  const payload = await getFeedback(content, userInput, isKidsLesson);

  // Log the attempt (RLS: own rows only, so the user client works).
  await supabase.from("practice_attempts").insert({
    profile_id: profile.id,
    lesson_block_id: block.id,
    user_input: userInput,
    ai_feedback: payload.feedback,
  });

  return NextResponse.json(payload);
}

async function getFeedback(
  content: PracticeContent,
  userInput: string,
  isKidsLesson: boolean,
): Promise<FeedbackPayload> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Graceful mock so the lesson engine is fully testable before the
    // key is configured.
    return {
      feedback: isKidsLesson
        ? "Great effort! Your idea is creative. Next time, add one more detail to make it even better. (Test feedback: AI coach is not connected yet.)"
        : "Nice work! Your prompt is clear about what you want. To make it stronger, add context about who the result is for and the tone you need. (Test feedback: AI coach is not connected yet.)",
      sample: isKidsLesson
        ? "Here is an example of what the AI might create from your idea: a short, fun result that uses your words. (Test sample.)"
        : "Here is an example of what the AI might produce for your prompt: a focused, well-structured result matching your request. (Test sample.)",
    };
  }

  const client = new Anthropic();

  const system = [
    content.system_prompt,
    isKidsLesson
      ? "You are speaking to a child. Be warm, encouraging and simple. Keep feedback to 2 short sentences and the sample under 80 words. Never discuss anything unrelated to this exercise. Never ask questions back."
      : "Keep feedback to 2 or 3 sentences: one thing they did well, one concrete improvement. Keep the sample under 120 words.",
    `Task context: ${content.task_context}`,
    'Respond with JSON: {"feedback": string, "sample": string}. "feedback" is coaching on their attempt; "sample" shows what a strong result looks like.',
  ].join("\n\n");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system,
      thinking: { type: "disabled" },
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              feedback: { type: "string" },
              sample: { type: "string" },
            },
            required: ["feedback", "sample"],
            additionalProperties: false,
          },
        },
      },
      messages: [{ role: "user", content: userInput }],
    });

    const text = response.content.find((b) => b.type === "text");
    if (!text || response.stop_reason === "refusal") {
      throw new Error("empty response");
    }
    const parsed = JSON.parse(text.text) as FeedbackPayload;
    if (!parsed.feedback || !parsed.sample) throw new Error("bad shape");
    return parsed;
  } catch {
    return {
      feedback:
        "Good attempt! We could not reach the AI coach right now, so here is a general tip: make your instruction specific about the outcome, audience and tone you want.",
      sample:
        "A strong attempt states the goal, gives context and asks for a specific format. Try again in a little while for personalized feedback.",
    };
  }
}
