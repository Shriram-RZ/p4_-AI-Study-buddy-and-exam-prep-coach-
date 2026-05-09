"use client";

import { create } from "zustand";
import type { User } from "@/lib/types";
import { authApi } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    education_level?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  init: async () => {
    set({ loading: true });
    try {
      const user = await authApi.me();
      set({ user, initialized: true, loading: false });
    } catch {
      set({ user: null, initialized: true, loading: false });
    }
  },
  login: async (email, password) => {
    const { user } = await authApi.login({ email, password });
    set({ user });
  },
  signup: async (data) => {
    const { user } = await authApi.signup(data);
    set({ user });
  },
  logout: async () => {
    await authApi.logout();
    set({ user: null });
  },
}));
