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
  BookOpen,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/auth";

export default function DashboardHome() {
  const user = useAuth((s) => s.user);

  return (
    <>
      <Topbar title="Today" />
      <main className="flex-1 p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            label="Current streak"
            value={`${user?.streak ?? 0} days`}
            color="from-orange-400 to-pink-500"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Productivity"
            value={`${user?.productivity_score ?? 78}/100`}
            color="from-emerald-400 to-teal-600"
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Weak topics"
            value="3 active"
            color="from-rose-400 to-orange-500"
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Next exam"
            value="JEE · 47d"
            color="from-brand-500 to-violet-600"
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
                      Today's plan
                    </p>
                    <h2 className="text-xl font-semibold">
                      4h 15m of focused study
                    </h2>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/planner">
                      Open planner <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      t: "Calculus · Limits",
                      h: "1h",
                      done: true,
                      note: "AI summary ready",
                    },
                    {
                      t: "Physics · Wave Optics",
                      h: "45m",
                      done: true,
                      note: "8/10 quiz · review 2",
                    },
                    {
                      t: "DSA · Recursion",
                      h: "1.5h",
                      done: false,
                      note: "Start with base cases",
                    },
                    {
                      t: "Flashcards SRS",
                      h: "20m",
                      done: false,
                      note: "12 due today",
                    },
                  ].map((it, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3"
                    >
                      {it.done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            it.done ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {it.t}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {it.note}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {it.h}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full bg-gradient-to-br from-brand-500 to-violet-600 text-white">
              <CardContent className="flex h-full flex-col p-6">
                <Sparkles className="h-6 w-6" />
                <h3 className="mt-3 text-lg font-semibold">
                  AI recommendation
                </h3>
                <p className="mt-2 text-sm opacity-90">
                  You missed 2 questions on integration by parts in your last
                  quiz. I drafted a 25-min focused practice with 8 fresh
                  questions.
                </p>
                <Button
                  asChild
                  variant="glass"
                  className="mt-auto bg-white/15 text-white hover:bg-white/25"
                >
                  <Link href="/dashboard/quizzes">
                    Start practice <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Calculus</p>
                <span className="text-xs text-muted-foreground">72%</span>
              </div>
              <Progress value={72} />
              <p className="mt-3 text-xs text-muted-foreground">
                Mastery improving · 3 sessions this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Physics</p>
                <span className="text-xs text-muted-foreground">58%</span>
              </div>
              <Progress value={58} />
              <p className="mt-3 text-xs text-muted-foreground">
                Wave Optics needs revision
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Chemistry</p>
                <span className="text-xs text-muted-foreground">81%</span>
              </div>
              <Progress value={81} />
              <p className="mt-3 text-xs text-muted-foreground">
                On track · maintain weekly reviews
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4 text-brand-500" /> Quick start
                </h3>
              </div>
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
                  desc="12 cards due today."
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
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
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
