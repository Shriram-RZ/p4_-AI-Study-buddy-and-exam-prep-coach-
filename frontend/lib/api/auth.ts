import { api } from "./client";
import type { User } from "@/lib/types";

export const authApi = {
  signup: async (data: {
    email: string;
    password: string;
    name: string;
    education_level?: string;
  }) => {
    const r = await api.post<{ user: User }>("/api/auth/signup", data);
    return r.data;
  },
  login: async (data: { email: string; password: string }) => {
    const r = await api.post<{ user: User }>("/api/auth/login", data);
    return r.data;
  },
  logout: async () => {
    await api.post("/api/auth/logout");
  },
  me: async () => {
    const r = await api.get<{ user: User }>("/api/auth/me");
    return r.data.user;
  },
  updateProfile: async (data: {
    name: string;
    education_level?: string | null;
    avatar_url?: string | null;
    daily_study_hours: number;
    exam_target?: string | null;
    notification_preferences: User["notification_preferences"];
  }) => {
    const r = await api.patch<{ user: User }>("/api/auth/profile", data);
    return r.data.user;
  },
  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    await api.post("/api/auth/change-password", data);
  },
  forgotPassword: async (email: string) => {
    const r = await api.post<{ reset_token: string }>(
      "/api/auth/forgot-password",
      { email }
    );
    return r.data;
  },
  resetPassword: async (token: string, password: string) => {
    await api.post("/api/auth/reset-password", { token, password });
  },
};
