"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCheck,
  FileText,
  Layers,
  MessageSquare,
  Trophy,
} from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/hooks/useNotifications";
import type { AppNotification, NotificationCategory } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const CATEGORY_META: Record<
  NotificationCategory,
  { icon: typeof Bell; tint: string }
> = {
  quiz: { icon: Brain, tint: "text-violet-500 bg-violet-500/10" },
  planner: { icon: CalendarDays, tint: "text-brand-500 bg-brand-500/10" },
  flashcards: { icon: Layers, tint: "text-amber-500 bg-amber-500/10" },
  notes: { icon: FileText, tint: "text-sky-500 bg-sky-500/10" },
  tutor: { icon: MessageSquare, tint: "text-emerald-500 bg-emerald-500/10" },
  mock: { icon: Trophy, tint: "text-rose-500 bg-rose-500/10" },
  system: { icon: BookOpen, tint: "text-muted-foreground bg-muted" },
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "quiz", label: "Quiz" },
  { key: "planner", label: "Planner" },
  { key: "flashcards", label: "Cards" },
  { key: "notes", label: "Notes" },
  { key: "tutor", label: "Tutor" },
];

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading } = useNotifications(filter);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unread = data?.unread_count ?? 0;

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleClick = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <button
                onClick={() => markAll.mutate()}
                disabled={unread === 0}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition",
                    filter === f.key
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2 p-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium">You're all caught up</p>
                  <p className="text-xs text-muted-foreground">
                    New activity will show up here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((n) => {
                    const meta = CATEGORY_META[n.category] ?? CATEGORY_META.system;
                    const Icon = meta.icon;
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => handleClick(n)}
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/60",
                            !n.read && "bg-brand-500/[0.04]"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                              meta.tint
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                              )}
                            </span>
                            {n.body && (
                              <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                                {n.body}
                              </span>
                            )}
                            <span className="mt-1 block text-[11px] text-muted-foreground/70">
                              {timeAgo(n.created_at)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
