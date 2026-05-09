export interface User {
  id: string;
  email: string;
  name: string;
  education_level?: string | null;
  streak: number;
  productivity_score: number;
  created_at: string;
}

export interface StudyPlan {
  id: string;
  exam_name: string;
  exam_date: string;
  daily_hours: number;
  syllabus: string;
  schedule: ScheduleDay[];
  created_at: string;
}

export interface ScheduleDay {
  day: number;
  date: string;
  topics: string[];
  hours: number;
  goals: string[];
  break_schedule?: string;
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questions: Question[];
  created_at: string;
}

export interface Question {
  id: string;
  type: "mcq" | "fill" | "theory";
  question: string;
  options?: string[];
  correct_answer: string | number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
  ease: number;
  next_review: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface WeakArea {
  topic: string;
  score: number;
  last_practiced: string;
  recommended_action: string;
}
