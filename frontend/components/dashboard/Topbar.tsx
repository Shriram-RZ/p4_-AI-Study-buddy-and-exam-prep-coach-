"use client";

import { Search } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { NotificationCenter } from "./NotificationCenter";

export function Topbar({ title }: { title: string }) {
  const user = useAuth((s) => s.user);
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/70 px-6 backdrop-blur-xl">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {greet}, {user?.name?.split(" ")[0] ?? "friend"}
        </p>
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search topics, plans, notes…"
            className="h-9 w-64 rounded-lg border border-border bg-card/60 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <NotificationCenter />
      </div>
    </header>
  );
}
