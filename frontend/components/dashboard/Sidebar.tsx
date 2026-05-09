"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  FileText,
  Sparkles,
  Layers,
  Target,
  TrendingUp,
  Trophy,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/planner", label: "Study Planner", icon: Calendar },
  { href: "/dashboard/tutor", label: "AI Tutor", icon: MessageSquare },
  { href: "/dashboard/notes", label: "Notes Summarizer", icon: FileText },
  { href: "/dashboard/quizzes", label: "Quiz Generator", icon: Sparkles },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Layers },
  { href: "/dashboard/weak-areas", label: "Weak Areas", icon: Target },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/mock-tests", label: "Mock Tests", icon: Trophy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 shadow shadow-brand-500/30">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight">
          Study<span className="gradient-text">Buddy</span>
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-brand-500/10 to-violet-500/10 text-brand-600"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 h-6 w-1 rounded-r-full bg-gradient-to-b from-brand-500 to-violet-600"
                />
              )}
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-gradient-to-br from-orange-400/10 to-pink-500/10 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 text-white">
            <Flame className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="truncate text-sm font-semibold">
              {user?.streak ?? 0} days
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <button
            onClick={async () => {
              await logout();
              toast.success("Signed out");
              router.push("/");
            }}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
