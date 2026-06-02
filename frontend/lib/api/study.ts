import { api } from "./client";
import type {
  StudyPlan,
  Quiz,
  Flashcard,
  ChatMessage,
  PlanGranularity,
} from "@/lib/types";

export const studyApi = {
  // Study Planner
  createPlan: async (payload: {
    exam_name: string;
    exam_date: string;
    daily_hours: number;
    syllabus: string;
    weak_topics?: string[];
    granularity?: PlanGranularity;
  }) => {
    const r = await api.post<{ plan: StudyPlan }>(
      "/api/study/plans",
      payload
    );
    return r.data.plan;
  },
  listPlans: async (includeArchived = false) => {
    const r = await api.get<{ plans: StudyPlan[] }>("/api/study/plans", {
      params: { include_archived: includeArchived || undefined },
    });
    return r.data.plans;
  },
  updatePlan: async (
    id: string,
    patch: { exam_name?: string; archived?: boolean }
  ) => {
    const r = await api.patch<{ plan: StudyPlan }>(
      `/api/study/plans/${id}`,
      patch
    );
    return r.data.plan;
  },
  duplicatePlan: async (id: string) => {
    const r = await api.post<{ plan: StudyPlan }>(
      `/api/study/plans/${id}/duplicate`
    );
    return r.data.plan;
  },
  deletePlan: async (id: string) => {
    await api.delete(`/api/study/plans/${id}`);
  },

  // Notes Summarizer
  summarize: async (text: string) => {
    const r = await api.post<{ summary: string; key_points: string[] }>(
      "/api/study/summarize",
      { text }
    );
    return r.data;
  },
  uploadNote: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await api.post<{ summary: string; key_points: string[] }>(
      "/api/study/upload-note",
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return r.data;
  },

  // Quizzes
  generateQuiz: async (payload: {
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    count: number;
    type?: "mcq" | "fill" | "theory" | "mixed";
  }) => {
    const r = await api.post<{ quiz: Quiz }>("/api/study/quiz", payload);
    return r.data.quiz;
  },
  submitQuiz: async (quizId: string, answers: Record<string, string>) => {
    const r = await api.post<{
      score: number;
      total: number;
      weak_topics: string[];
      review: { question_id: string; correct: boolean; explanation: string }[];
    }>(`/api/study/quiz/${quizId}/submit`, { answers });
    return r.data;
  },

  // Flashcards
  generateFlashcards: async (topic: string, count = 10) => {
    const r = await api.post<{ flashcards: Flashcard[] }>(
      "/api/study/flashcards",
      { topic, count }
    );
    return r.data.flashcards;
  },
  reviewFlashcard: async (id: string, quality: number) => {
    await api.post(`/api/study/flashcards/${id}/review`, { quality });
  },

  // AI Tutor
  chat: async (message: string, history: ChatMessage[] = []) => {
    const r = await api.post<{ reply: string; message_id: string }>(
      "/api/tutor/chat",
      { message, history }
    );
    return r.data;
  },
  chatStream: (
    message: string,
    history: ChatMessage[],
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (e: unknown) => void
  ) => {
    const ctrl = new AbortController();
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/tutor/chat-stream`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
        signal: ctrl.signal,
      }
    )
      .then(async (res) => {
        if (!res.body) throw new Error("No stream");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") {
                onDone();
                return;
              }
              try {
                const obj = JSON.parse(payload);
                if (obj.text) onChunk(obj.text);
              } catch {
                onChunk(payload);
              }
            }
          }
        }
        onDone();
      })
      .catch(onError);
    return () => ctrl.abort();
  },

  // Progress
  getProgress: async () => {
    const r = await api.get<{
      streak: number;
      productivity: number;
      weekly: { date: string; minutes: number }[];
      weak_areas: { topic: string; score: number }[];
    }>("/api/study/progress");
    return r.data;
  },
};
