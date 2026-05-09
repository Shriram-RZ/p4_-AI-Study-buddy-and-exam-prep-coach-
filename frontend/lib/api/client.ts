import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ detail?: string }>) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith("/dashboard")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(err);
  }
);

export function apiError(err: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.detail || err.message || fallback;
  }
  return fallback;
}
