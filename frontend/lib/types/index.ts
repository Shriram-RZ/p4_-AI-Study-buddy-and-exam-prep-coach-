export interface User {
  id: string;
  email: string;
  name: string;
  education_level?: string | null;
  avatar_url?: string | null;
  daily_study_hours: number;
  exam_target?: string | null;
  notification_preferences: {
    quiz: boolean;
    revision: boolean;
    flashcards: boolean;
    tutor: boolean;
  };
  streak: number;
  productivity_score: number;
  created_at: string;
}

export type PlanGranularity = "daily" | "weekly" | "monthly";

export interface StudyPlan {
  id: string;
  exam_name: string;
  exam_date: string;
  daily_hours: number;
  syllabus: string;
  schedule: ScheduleDay[];
  granularity: PlanGranularity;
  archived: boolean;
  created_at: string;
}

export interface ScheduleDay {
  day: number;
  period?: string;
  date: string;
  topics: string[];
  hours: number;
  priority?: "high" | "medium" | "low";
  goals: string[];
  revision?: string[];
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
  topic_tag?: string | null;
}

export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
  ease: number;
  next_review: string;
  interval_days?: number;
  repetitions?: number;
  due?: boolean;
  mastered?: boolean;
}

export interface FlashcardStats {
  total: number;
  due: number;
  mastered: number;
  total_reviews: number;
  retention_rate: number;
  review_streak: number;
  daily_reviews: { date: string; count: number }[];
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

export interface WeakAreaDetail {
  topic: string;
  score: number;
  severity: "critical" | "high" | "moderate";
  suggested_minutes: number;
  last_practiced: string;
  recommended_action: string;
}

export interface Analytics {
  summary: {
    streak: number;
    productivity: number;
    quizzes_taken: number;
    avg_accuracy: number;
    total_activities: number;
    mastered_cards: number;
  };
  quiz_accuracy: { date: string; accuracy: number }[];
  daily: { date: string; activities: number; reviews: number }[];
  topic_mastery: { topic: string; mastery: number }[];
}

export type NotificationCategory =
  | "quiz"
  | "planner"
  | "flashcards"
  | "notes"
  | "tutor"
  | "mock"
  | "system";

export interface AppNotification {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  summary: string;
  entity_type?: string | null;
  entity_id?: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}
