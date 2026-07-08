// Seeds the Phase 3 mini-tracks (one adult, one kids) through the
// service-role client. Idempotent: skips any track whose slug exists.
// Run: node scripts/seed-tracks.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const vars = {};
env.split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) vars[m[1]] = m[2];
});

const admin = createClient(
  vars.NEXT_PUBLIC_SUPABASE_URL,
  vars.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const TRACKS = [
  {
    slug: "chatgpt-for-work",
    title: "ChatGPT for Work",
    description:
      "Use AI to write, plan and problem-solve at work. No tech background needed.",
    audience: "adult",
    age_band: null,
    sort_order: 1,
    modules: [
      {
        title: "Getting Started",
        lessons: [
          {
            title: "Meet your new assistant",
            estimated_minutes: 6,
            blocks: [
              {
                block_type: "concept",
                content: {
                  screens: [
                    {
                      text: "Think of ChatGPT as a smart assistant who has read millions of books, reports and emails.\n\nIt can write, summarize, translate and brainstorm. But it only works as well as the instructions you give it.",
                    },
                    {
                      text: "Those instructions are called prompts.\n\nA prompt is just a message telling the AI what you want. The clearer your prompt, the better the result. That is the one skill this course builds.",
                    },
                    {
                      text: "Here is the golden rule:\n\nTell it WHO it should act as, WHAT you need, and HOW you want it delivered.\n\nMiss one of those and you get generic answers.",
                    },
                  ],
                },
              },
              {
                block_type: "example",
                content: {
                  screens: [
                    {
                      text: "Weak prompt:\n\n\"Write an email.\"\n\nThe AI has to guess everything: who it is for, what it is about, what tone to use. You will get something bland.",
                    },
                    {
                      text: "Strong prompt:\n\n\"Act as a customer service manager. Write a short, warm email apologizing to a customer whose delivery arrived 3 days late. Offer a 10% discount on their next order.\"\n\nWho + what + how. Night and day difference.",
                    },
                  ],
                },
              },
              {
                block_type: "practice",
                content: {
                  instructions:
                    "Write a prompt asking the AI to draft a message to your boss requesting Friday afternoon off. Include who the AI should act as, what you need, and the tone you want.",
                  task_context:
                    "The learner is practicing writing a clear prompt for drafting a professional request to their manager. Judge the prompt (not the leave request itself) on: role given to the AI, clarity of the request, and tone/format instructions.",
                  system_prompt:
                    "You are a friendly, practical AI-skills coach for working adults in Kenya. Evaluate the learner's prompt and show what a strong result would look like.",
                  max_length: 600,
                },
              },
              {
                block_type: "quiz",
                content: {
                  questions: [
                    {
                      type: "mcq",
                      question: "What is a prompt?",
                      options: [
                        "A type of AI model",
                        "The instructions you give an AI",
                        "A paid ChatGPT feature",
                        "An error message",
                      ],
                      correct: 1,
                      explanation:
                        "A prompt is simply the message you send telling the AI what you want.",
                    },
                    {
                      type: "prompt_pick",
                      question: "Which prompt will get a better result?",
                      options: [
                        "\"Write a product description.\"",
                        "\"Act as a marketer. Write a 50-word product description for handmade leather sandals, aimed at tourists, in a fun tone.\"",
                      ],
                      correct: 1,
                      explanation:
                        "It tells the AI who to act as, what to write, for whom, and in what tone.",
                    },
                    {
                      type: "fill_blank",
                      question:
                        "The golden rule: tell the AI who it should act as, ____ you need, and how you want it delivered.",
                      accept: ["what"],
                      explanation: "Who, WHAT, and how. That is the formula.",
                    },
                  ],
                },
              },
            ],
          },
          {
            title: "Prompts that get results",
            estimated_minutes: 7,
            blocks: [
              {
                block_type: "concept",
                content: {
                  screens: [
                    {
                      text: "Your first answer from AI is a draft, not the final product.\n\nThe real power move is the follow-up: ask it to change tone, shorten, expand or fix what you did not like.",
                    },
                    {
                      text: "This is called iterating.\n\n\"Make it shorter.\" \"Make it more formal.\" \"Give me 3 more options.\"\n\nEach follow-up sharpens the result. Professionals rarely accept the first draft.",
                    },
                  ],
                },
              },
              {
                block_type: "example",
                content: {
                  screens: [
                    {
                      text: "First result: a 200-word email that sounds stiff.\n\nFollow-up: \"Cut it to 80 words and make it sound friendly but professional.\"\n\nResult: exactly what you needed, in seconds.",
                    },
                    {
                      text: "Another trick: give examples.\n\n\"Here is an email I liked: [paste]. Write mine in the same style.\"\n\nThe AI copies patterns brilliantly. Feed it good patterns.",
                    },
                  ],
                },
              },
              {
                block_type: "practice",
                content: {
                  instructions:
                    "Imagine the AI gave you a long, boring paragraph about your business. Write the follow-up prompt you would send to improve it. Be specific about what should change.",
                  task_context:
                    "The learner is practicing iteration: writing a follow-up prompt that gives specific, actionable revision instructions (length, tone, format, audience). Judge specificity and clarity of the requested changes.",
                  system_prompt:
                    "You are a friendly, practical AI-skills coach for working adults in Kenya. Evaluate the learner's follow-up prompt and show what a strong revised result would look like.",
                  max_length: 600,
                },
              },
              {
                block_type: "quiz",
                content: {
                  questions: [
                    {
                      type: "mcq",
                      question:
                        "The AI gives you a decent but too-long answer. Best next move?",
                      options: [
                        "Accept it, AI knows best",
                        "Start over with a new chat",
                        "Ask a follow-up: \"Cut this to 100 words\"",
                        "Give up and write it yourself",
                      ],
                      correct: 2,
                      explanation:
                        "Iterating with follow-ups is faster than starting over and gets you exactly what you need.",
                    },
                    {
                      type: "prompt_pick",
                      question: "Which follow-up will improve a draft more?",
                      options: [
                        "\"Make it better.\"",
                        "\"Make it warmer, cut it to 3 sentences, and end with a question.\"",
                      ],
                      correct: 1,
                      explanation:
                        "Specific instructions produce specific improvements. Vague asks get vague results.",
                    },
                    {
                      type: "fill_blank",
                      question:
                        "Refining AI output with follow-up prompts is called ____.",
                      accept: ["iterating", "iteration"],
                      explanation:
                        "Iterating: treating the first answer as a draft and improving it step by step.",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "ai-explorers-8-12",
    title: "AI Explorers",
    description:
      "Discover what AI is and create fun things with it. For ages 8 to 12.",
    audience: "kids",
    age_band: "8-12",
    sort_order: 1,
    modules: [
      {
        title: "First Steps",
        lessons: [
          {
            title: "What is AI?",
            estimated_minutes: 5,
            blocks: [
              {
                block_type: "concept",
                content: {
                  screens: [
                    {
                      text: "AI stands for Artificial Intelligence. 🤖\n\nIt is a computer program that learned from millions of books, pictures and stories. That is how it can answer questions and make things.",
                    },
                    {
                      text: "AI is smart, but it is not magic.\n\nIt does not think or feel like you do. It is more like a super-fast helper that follows your instructions.",
                    },
                    {
                      text: "The better you explain what you want, the cooler the things AI makes for you.\n\nLet's see it in action!",
                    },
                  ],
                },
              },
              {
                block_type: "example",
                content: {
                  screens: [
                    {
                      text: "If you tell AI: \"Make a story\"...\n\nyou get a random story about anything. Maybe boring!",
                    },
                    {
                      text: "But if you say: \"Make a funny story about a lion who is scared of chickens\"...\n\nyou get exactly the story YOU imagined. Details make it awesome. 🦁🐔",
                    },
                  ],
                },
              },
              {
                block_type: "practice",
                content: {
                  instructions:
                    "Fill in the blank to create your own animal story! Pick any animal you like.",
                  task_context:
                    "A child aged 8 to 12 is completing a guided story template with an animal of their choice. Respond with encouraging feedback about their choice and a very short sample story.",
                  system_prompt:
                    "You are a cheerful, safe AI guide for children aged 8 to 12. Only ever talk about the story exercise. Use simple words, short sentences and positive energy. Never discuss any other topic, never ask for personal information, never ask questions back.",
                  kid_safe: true,
                  template:
                    "Write a funny three-sentence story about ___ who learns to be brave.",
                  max_length: 40,
                },
              },
              {
                block_type: "quiz",
                content: {
                  questions: [
                    {
                      type: "mcq",
                      question: "What does AI stand for?",
                      options: [
                        "Amazing Internet",
                        "Artificial Intelligence",
                        "Automatic Ideas",
                      ],
                      correct: 1,
                      explanation:
                        "AI means Artificial Intelligence: a computer program that learned from lots of information.",
                    },
                    {
                      type: "prompt_pick",
                      question: "Which instruction makes a COOLER story?",
                      options: [
                        "\"Make a story\"",
                        "\"Make a funny story about a lion scared of chickens\"",
                      ],
                      correct: 1,
                      explanation:
                        "Details tell the AI exactly what YOU imagined. More details, cooler story!",
                    },
                    {
                      type: "fill_blank",
                      question: "AI is smart, but it is not ____.",
                      accept: ["magic"],
                      explanation:
                        "AI is a program, not magic. It just follows your instructions really fast.",
                    },
                  ],
                },
              },
            ],
          },
          {
            title: "Talking to AI",
            estimated_minutes: 5,
            blocks: [
              {
                block_type: "concept",
                content: {
                  screens: [
                    {
                      text: "Talking to AI is like giving directions to a friend. 🗺️\n\nIf you say \"go somewhere\", they get lost. If you say \"walk to the big tree, then turn left\", they arrive!",
                    },
                    {
                      text: "AI loves details:\n\nWHO is in your story or picture?\nWHERE does it happen?\nWHAT makes it fun?\n\nAnswer those and AI makes something amazing.",
                    },
                  ],
                },
              },
              {
                block_type: "example",
                content: {
                  screens: [
                    {
                      text: "Boring: \"Draw a house.\"\n\nAwesome: \"Draw a tiny purple house on top of a giraffe, with a slide instead of stairs.\" 🦒🏠",
                    },
                    {
                      text: "See the difference?\n\nThe details came from imagination. AI does the making, but YOU do the imagining. That is your superpower.",
                    },
                  ],
                },
              },
              {
                block_type: "practice",
                content: {
                  instructions:
                    "Fill in the blank with a place you would love to visit. Make it as fun as you can!",
                  task_context:
                    "A child aged 8 to 12 is completing a guided template describing an adventure in a place of their choice. Respond with encouraging feedback and a very short sample adventure.",
                  system_prompt:
                    "You are a cheerful, safe AI guide for children aged 8 to 12. Only ever talk about the adventure exercise. Use simple words, short sentences and positive energy. Never discuss any other topic, never ask for personal information, never ask questions back.",
                  kid_safe: true,
                  template:
                    "Describe a one-day adventure in ___ with a talking parrot as my guide.",
                  max_length: 40,
                },
              },
              {
                block_type: "quiz",
                content: {
                  questions: [
                    {
                      type: "mcq",
                      question: "Talking to AI works best when you...",
                      options: [
                        "Use as few words as possible",
                        "Give clear details about what you want",
                        "Type in capital letters",
                      ],
                      correct: 1,
                      explanation:
                        "Details are directions. Clear directions get you exactly where you want to go.",
                    },
                    {
                      type: "prompt_pick",
                      question: "Which one is a better instruction?",
                      options: [
                        "\"Draw an animal\"",
                        "\"Draw a baby elephant splashing in a puddle wearing red boots\"",
                      ],
                      correct: 1,
                      explanation:
                        "The second one uses imagination and details. That is the superpower!",
                    },
                    {
                      type: "fill_blank",
                      question:
                        "AI does the making, but YOU do the ____.",
                      accept: ["imagining", "imagination"],
                      explanation:
                        "Your imagination gives AI the ideas. That part is all you.",
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

for (const trackDef of TRACKS) {
  const { data: existing } = await admin
    .from("tracks")
    .select("id")
    .eq("slug", trackDef.slug)
    .maybeSingle();
  if (existing) {
    console.log(`skip: track '${trackDef.slug}' already exists`);
    continue;
  }

  const { data: track, error: trackError } = await admin
    .from("tracks")
    .insert({
      slug: trackDef.slug,
      title: trackDef.title,
      description: trackDef.description,
      audience: trackDef.audience,
      age_band: trackDef.age_band,
      sort_order: trackDef.sort_order,
      is_published: true,
    })
    .select()
    .single();
  if (trackError) throw trackError;

  for (const [mi, moduleDef] of trackDef.modules.entries()) {
    const { data: module, error: moduleError } = await admin
      .from("modules")
      .insert({ track_id: track.id, title: moduleDef.title, sort_order: mi })
      .select()
      .single();
    if (moduleError) throw moduleError;

    for (const [li, lessonDef] of moduleDef.lessons.entries()) {
      const { data: lesson, error: lessonError } = await admin
        .from("lessons")
        .insert({
          module_id: module.id,
          title: lessonDef.title,
          sort_order: li,
          estimated_minutes: lessonDef.estimated_minutes,
          is_published: true,
        })
        .select()
        .single();
      if (lessonError) throw lessonError;

      const blocks = lessonDef.blocks.map((b, bi) => ({
        lesson_id: lesson.id,
        block_type: b.block_type,
        sort_order: bi,
        content: b.content,
      }));
      const { error: blocksError } = await admin
        .from("lesson_blocks")
        .insert(blocks);
      if (blocksError) throw blocksError;
    }
  }
  console.log(`seeded: ${trackDef.slug} (${track.id})`);
}

console.log("done");
