"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  Target,
  Sparkles,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity as ActivityIcon,
  Brain,
  Layers,
  FileText,
  MessageSquare,
  CalendarDays,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/auth";
import { usePlans, useProgress } from "@/lib/hooks/useStudy";
import { useActivityFeed } from "@/lib/hooks/useNotifications";
import { daysUntil, timeAgo } from "@/lib/utils/time";

// Map an activity action to an icon + tint for the recent-activity feed.
const ACTION_META: Record<string, { icon: typeof Brain; tint: string }> = {
  quiz_generated: { icon: Brain, tint: "text-violet-500 bg-violet-500/10" },
  quiz_completed: { icon: Brain, tint: "text-violet-500 bg-violet-500/10" },
  plan_generated: { icon: CalendarDays, tint: "text-brand-500 bg-brand-500/10" },
  flashcards_ready: { icon: Layers, tint: "text-amber-500 bg-amber-500/10" },
  flashcards_reviewed: { icon: Layers, tint: "text-amber-500 bg-amber-500/10" },
  summary_completed: { icon: FileText, tint: "text-sky-500 bg-sky-500/10" },
  tutor_session: { icon: MessageSquare, tint: "text-emerald-500 bg-emerald-500/10" },
};

export default function DashboardHome() {
  const user = useAuth((s) => s.user);
  const { data: plans = [] } = usePlans();
  const { data: progress } = useProgress();
  const { data: activities = [] } = useActivityFeed(12);

  // The "active" plan = the one whose exam is soonest in the future.
  const upcoming = plans
    .map((p) => ({ plan: p, days: daysUntil(p.exam_date) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days);
  const active = upcoming[0] ?? (plans[0] ? { plan: plans[0], days: daysUntil(plans[0].exam_date) } : null);

  const weakAreas = progress?.weak_areas ?? [];
  const todayFocus = active?.plan.schedule?.[0];

  return (
    <>
      <Topbar title="Today" />
      <main className="flex-1 p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            label="Current streak"
            value={`${user?.streak ?? 0} ${(user?.streak ?? 0) === 1 ? "day" : "days"}`}
            color="from-orange-400 to-pink-500"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Productivity"
            value={`${progress?.productivity ?? user?.productivity_score ?? 70}/100`}
            color="from-emerald-400 to-teal-600"
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Weak topics"
            value={weakAreas.length ? `${weakAreas.length} active` : "None yet"}
            color="from-rose-400 to-orange-500"
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Next exam"
            value={
              active
                ? `${active.plan.exam_name.split(" ")[0]} · ${active.days}d`
                : "No exam set"
            }
            color="from-brand-500 to-violet-600"
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Today's focus from the active plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Today's focus
                    </p>
                    <h2 className="text-xl font-semibold">
                      {active
                        ? `${active.plan.exam_name} · ${active.plan.daily_hours}h/day`
                        : "No active study plan"}
                    </h2>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/planner">
                      Open planner <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                {todayFocus ? (
                  <div className="space-y-3">
                    {todayFocus.topics.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3"
                      >
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t}</p>
                          {todayFocus.goals?.[i] && (
                            <p className="text-xs text-muted-foreground">
                              {todayFocus.goals[i]}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {todayFocus.hours}h
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <CalendarDays className="mx-auto h-7 w-7 text-muted-foreground/50" />
                    <p className="mt-2 text-sm font-medium">
                      Generate a study plan to see today's focus
                    </p>
                    <Button asChild size="sm" className="mt-3">
                      <Link href="/dashboard/planner">Create a plan</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent activity (real) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="flex h-full flex-col p-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <ActivityIcon className="h-4 w-4 text-brand-500" /> Recent
                  activity
                </h3>
                {activities.length ? (
                  <ul className="mt-4 space-y-3">
                    {activities.slice(0, 6).map((a) => {
                      const meta = ACTION_META[a.action] ?? {
                        icon: Sparkles,
                        tint: "text-muted-foreground bg-muted",
                      };
                      const Icon = meta.icon;
                      return (
                        <li key={a.id} className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${meta.tint}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm">{a.summary}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {timeAgo(a.created_at)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="my-auto text-center text-sm text-muted-foreground">
                    No activity yet. Generate a quiz, plan, or summary to get
                    started.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Weak areas / mastery (real) */}
        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-rose-500" /> Weak areas to
                review
              </h3>
              {weakAreas.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {weakAreas.slice(0, 6).map((w) => (
                    <div key={w.topic}>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="truncate text-sm font-medium">
                          {w.topic}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(w.score)}%
                        </span>
                      </div>
                      <Progress value={Math.round(w.score)} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No weak areas detected yet — take a quiz and I'll start
                  tracking the topics you miss.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick start */}
        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold">Quick start</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <QuickAction
                  href="/dashboard/tutor"
                  title="Ask the AI tutor"
                  desc="Stuck on something? Chat now."
                />
                <QuickAction
                  href="/dashboard/notes"
                  title="Summarize notes"
                  desc="Drop a PDF or paste text."
                />
                <QuickAction
                  href="/dashboard/quizzes"
                  title="Generate a quiz"
                  desc="Pick a topic, set difficulty."
                />
                <QuickAction
                  href="/dashboard/flashcards"
                  title="Review flashcards"
                  desc="Spaced-repetition review."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div
          className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${color} text-white shadow`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
        Open <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
