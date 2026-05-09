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
