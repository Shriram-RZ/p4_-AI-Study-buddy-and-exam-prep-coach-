"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "@/lib/api/study";
import { notificationKeys } from "./useNotifications";

export const studyKeys = {
  plans: ["study", "plans"] as const,
  progress: ["study", "progress"] as const,
  weakAreas: ["study", "weak-areas"] as const,
};

export function useWeakAreas() {
  return useQuery({
    queryKey: studyKeys.weakAreas,
    queryFn: () => studyApi.weakAreas(),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["study", "analytics"],
    queryFn: () => studyApi.analytics(),
  });
}

/** Cached list of the user's saved study plans. Cached so navigating away and
 *  back to the planner is instant and the data survives the tab switch. */
export function usePlans(includeArchived = false) {
  return useQuery({
    queryKey: [...studyKeys.plans, includeArchived],
    queryFn: () => studyApi.listPlans(includeArchived),
    retry: (failureCount, error) => {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 422
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studyApi.createPlan,
    onSuccess: (plan) => {
      // Prepend the new plan to the cached list (no refetch needed) and
      // refresh notifications/activity since the backend just emitted events.
      qc.setQueryData<Awaited<ReturnType<typeof studyApi.listPlans>>>(
        studyKeys.plans,
        (prev) => (prev ? [plan, ...prev] : [plan])
      );
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { exam_name?: string; archived?: boolean };
    }) => studyApi.updatePlan(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: studyKeys.plans }),
  });
}

export function useDuplicatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studyApi.duplicatePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: studyKeys.plans }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studyApi.deletePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: studyKeys.plans }),
  });
}

/** Cached progress snapshot. */
export function useProgress() {
  return useQuery({
    queryKey: studyKeys.progress,
    queryFn: () => studyApi.getProgress(),
  });
}
