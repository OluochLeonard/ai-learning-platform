export const FUNNEL_SESSION_COOKIE = "funnel_sid";

export type QuizOption = { value: string; label: string; emoji?: string };
export type QuizQuestion = {
  key: string;
  question: string;
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    key: "goal",
    question: "What do you want AI to do for you?",
    options: [
      { value: "side_income", label: "Help me earn a side income", emoji: "💰" },
      { value: "better_job", label: "Boost my career or job hunt", emoji: "📈" },
      { value: "own_business", label: "Grow my business", emoji: "🏪" },
      { value: "curiosity", label: "I just want to understand it", emoji: "💡" },
    ],
  },
  {
    key: "ai_knowledge",
    question: "How much have you used AI tools like ChatGPT?",
    options: [
      { value: "none", label: "Never used them", emoji: "🌱" },
      { value: "basics", label: "Tried a few times", emoji: "🙂" },
      { value: "regular", label: "I use them often", emoji: "⚡" },
    ],
  },
  {
    key: "time_per_day",
    question: "How much time can you give per day?",
    options: [
      { value: "5min", label: "5 minutes", emoji: "☕" },
      { value: "10min", label: "10 minutes", emoji: "🕑" },
      { value: "20min", label: "20 minutes or more", emoji: "🔥" },
    ],
  },
  {
    key: "occupation",
    question: "What best describes you right now?",
    options: [
      { value: "employed", label: "Employed", emoji: "💼" },
      { value: "self_employed", label: "Self-employed / business owner", emoji: "🧑‍💻" },
      { value: "student", label: "Student", emoji: "🎓" },
      { value: "job_seeking", label: "Looking for work", emoji: "🔎" },
    ],
  },
  {
    key: "income_interest",
    question: "Interested in earning money with AI skills?",
    options: [
      { value: "yes_urgent", label: "Yes, as soon as possible", emoji: "🚀" },
      { value: "yes_someday", label: "Yes, eventually", emoji: "🌤️" },
      { value: "not_focus", label: "Not my focus right now", emoji: "😌" },
    ],
  },
  {
    key: "device",
    question: "What will you learn on?",
    options: [
      { value: "phone", label: "My phone", emoji: "📱" },
      { value: "computer", label: "A computer", emoji: "💻" },
      { value: "both", label: "Both", emoji: "🔀" },
    ],
  },
];

// Recommendation keys double as future track slugs (Phase 3 wires them to
// real tracks rows and sets funnel_responses.recommended_track).
export type Recommendation = {
  key: string;
  title: string;
  pitch: string;
  outcomes: string[];
};

const RECOMMENDATIONS: Record<string, Recommendation> = {
  "earn-with-ai": {
    key: "earn-with-ai",
    title: "Earn With AI",
    pitch:
      "A practical path to making money with AI skills: freelancing, content, and digital services.",
    outcomes: [
      "Write winning proposals and gigs with AI",
      "Deliver client work 5x faster",
      "Find your first paying opportunity",
    ],
  },
  "ai-for-business": {
    key: "ai-for-business",
    title: "AI for Your Business",
    pitch:
      "Use AI to market, sell, and run your business better without hiring anyone.",
    outcomes: [
      "Create ads and posts that sell",
      "Answer customers faster with AI",
      "Automate the boring paperwork",
    ],
  },
  "chatgpt-for-work": {
    key: "chatgpt-for-work",
    title: "ChatGPT for Work",
    pitch:
      "Stand out at work or in your job hunt with skills employers now expect.",
    outcomes: [
      "Write emails and reports in minutes",
      "Prepare for interviews with AI",
      "Add AI skills to your CV",
    ],
  },
  "ai-foundations": {
    key: "ai-foundations",
    title: "AI Foundations",
    pitch:
      "Start from zero and get comfortable with the AI tools everyone is talking about.",
    outcomes: [
      "Understand what AI can and cannot do",
      "Master ChatGPT step by step",
      "Build a daily AI habit that sticks",
    ],
  },
};

export function recommendTrack(answers: Record<string, string>): Recommendation {
  if (answers.goal === "own_business" || answers.occupation === "self_employed") {
    return RECOMMENDATIONS["ai-for-business"];
  }
  if (answers.goal === "side_income" || answers.income_interest === "yes_urgent") {
    return RECOMMENDATIONS["earn-with-ai"];
  }
  if (answers.goal === "better_job" || answers.occupation === "employed") {
    return RECOMMENDATIONS["chatgpt-for-work"];
  }
  return RECOMMENDATIONS["ai-foundations"];
}

export function getRecommendationByKey(key: string | undefined): Recommendation {
  return (key && RECOMMENDATIONS[key]) || RECOMMENDATIONS["ai-foundations"];
}
