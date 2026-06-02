"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import type { AppNotification } from "@/lib/types";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (category: string) => ["notifications", "list", category] as const,
  activity: ["notifications", "activity"] as const,
};

/** Notification list + unread count. Polls so newly-created notifications
 *  (e.g. after generating a quiz) show up without a manual refresh. */
export function useNotifications(category = "all") {
  return useQuery({
    queryKey: notificationKeys.list(category),
    queryFn: () => notificationsApi.list({ category }),
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    // Optimistic: flip the item to read immediately across all cached lists.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const snapshots = qc.getQueriesData<{
        notifications: AppNotification[];
        unread_count: number;
      }>({ queryKey: notificationKeys.all });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        const wasUnread = data.notifications.find((n) => n.id === id && !n.read);
        qc.setQueryData(key, {
          ...data,
          unread_count: Math.max(0, data.unread_count - (wasUnread ? 1 : 0)),
          notifications: data.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      }
      return { snapshots };
    },
    onError: (_e, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const snapshots = qc.getQueriesData<{
        notifications: AppNotification[];
        unread_count: number;
      }>({ queryKey: notificationKeys.all });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        qc.setQueryData(key, {
          ...data,
          unread_count: 0,
          notifications: data.notifications.map((n) => ({ ...n, read: true })),
        });
      }
      return { snapshots };
    },
    onError: (_e, _v, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useActivityFeed(limit = 20) {
  return useQuery({
    queryKey: notificationKeys.activity,
    queryFn: () => notificationsApi.activity(limit),
    refetchInterval: 30_000,
  });
}
