"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "@/lib/api/study";
import { notificationKeys } from "./useNotifications";

export const flashcardKeys = {
  all: ["flashcards"] as const,
  list: (filter: string) => ["flashcards", "list", filter] as const,
  stats: ["flashcards", "stats"] as const,
};

export function useFlashcards(filter: "all" | "due" | "mastered" = "due") {
  return useQuery({
    queryKey: flashcardKeys.list(filter),
    queryFn: () => studyApi.listFlashcards(filter),
  });
}

export function useFlashcardStats() {
  return useQuery({
    queryKey: flashcardKeys.stats,
    queryFn: () => studyApi.flashcardStats(),
  });
}

export function useGenerateFlashcards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ topic, count }: { topic: string; count: number }) =>
      studyApi.generateFlashcards(topic, count),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: flashcardKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useReviewFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quality }: { id: string; quality: number }) =>
      studyApi.reviewFlashcard(id, quality),
    // Refresh stats after each review; the card list is managed locally during
    // a session so cards don't vanish mid-review.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: flashcardKeys.stats });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
