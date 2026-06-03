import { api } from "./client";
import { cleanParams } from "./params";
import type { AppNotification, ActivityItem } from "@/lib/types";

export const notificationsApi = {
  list: async (opts?: { category?: string; unreadOnly?: boolean }) => {
    const r = await api.get<{
      notifications: AppNotification[];
      unread_count: number;
    }>("/api/notifications", {
      params: cleanParams({
        category:
          opts?.category && opts.category !== "all" ? opts.category : undefined,
        unread_only: opts?.unreadOnly ? true : undefined,
      }),
    });
    return r.data;
  },
  markRead: async (id: string) => {
    await api.post(`/api/notifications/${id}/read`);
  },
  markAllRead: async () => {
    const r = await api.post<{ marked: number }>("/api/notifications/read-all");
    return r.data;
  },
  activity: async (limit = 20) => {
    const r = await api.get<{ activities: ActivityItem[] }>(
      "/api/notifications/activity",
      { params: { limit } }
    );
    return r.data.activities;
  },
};
