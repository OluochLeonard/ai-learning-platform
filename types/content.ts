import type { AgeBand } from "@/types/profile";

export type Track = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  audience: "adult" | "kids";
  age_band: AgeBand | null;
  cover_image_url: string | null;
  sort_order: number;
  is_published: boolean;
};

export type Module = {
  id: string;
  track_id: string;
  title: string;
  sort_order: number;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  sort_order: number;
  estimated_minutes: number;
  is_published: boolean;
};

export type LessonProgress = {
  id: string;
  profile_id: string;
  lesson_id: string;
  completed_at: string | null;
  quiz_score: number | null;
  started_at: string;
};

// ---- lesson_blocks.content shapes ----

export type Screen = { text: string; image_url?: string | null };

export type ConceptContent = { screens: Screen[] };

export type QuizQuestion =
  | {
      type: "mcq";
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }
  | {
      type: "prompt_pick";
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }
  | {
      type: "fill_blank";
      question: string;
      accept: string[];
      explanation: string;
    };

export type QuizContent = { questions: QuizQuestion[] };

export type PracticeContent = {
  instructions: string;
  task_context: string;
  system_prompt: string;
  kid_safe?: boolean;
  // Kids practice: fixed template with a ___ slot the child fills in.
  template?: string;
  max_length?: number;
};

export type LessonBlock = {
  id: string;
  lesson_id: string;
  block_type: "concept" | "example" | "practice" | "quiz";
  sort_order: number;
  content: ConceptContent | QuizContent | PracticeContent;
};

export const QUIZ_PASS_MARK = 60;
