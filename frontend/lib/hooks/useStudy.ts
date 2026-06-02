"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "@/lib/api/study";
import { notificationKeys } from "./useNotifications";

export const studyKeys = {
  plans: ["study", "plans"] as const,
  progress: ["study", "progress"] as const,
};

/** Cached list of the user's saved study plans. Cached so navigating away and
 *  back to the planner is instant and the data survives the tab switch. */
export function usePlans() {
  return useQuery({
    queryKey: studyKeys.plans,
    queryFn: () => studyApi.listPlans(),
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

/** Cached progress snapshot. */
export function useProgress() {
  return useQuery({
    queryKey: studyKeys.progress,
    queryFn: () => studyApi.getProgress(),
  });
}
