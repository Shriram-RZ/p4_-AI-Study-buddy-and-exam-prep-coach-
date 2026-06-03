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

/** Turn FastAPI `detail` (string or validation array) into toast-safe text. */
export function formatApiDetail(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          const loc = Array.isArray((item as { loc?: unknown }).loc)
            ? (item as { loc: unknown[] }).loc.filter(Boolean).join(".")
            : "";
          const msg = String((item as { msg: unknown }).msg);
          return loc ? `${loc}: ${msg}` : msg;
        }
        return null;
      })
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  if (detail && typeof detail === "object") {
    return JSON.stringify(detail);
  }
  return fallback;
}

export function apiError(err: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (detail !== undefined) return formatApiDetail(detail, fallback);
    return err.message || fallback;
  }
  return fallback;
}
