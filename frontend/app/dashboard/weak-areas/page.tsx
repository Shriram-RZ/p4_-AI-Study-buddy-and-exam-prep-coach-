"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Target, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWeakAreas } from "@/lib/hooks/useStudy";
import { timeAgo } from "@/lib/utils/time";
import { cn } from "@/lib/utils/cn";

const SEVERITY: Record<string, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "bg-rose-500/10 text-rose-600" },
  high: { label: "High", cls: "bg-amber-500/10 text-amber-600" },
  moderate: { label: "Moderate", cls: "bg-sky-500/10 text-sky-600" },
};

export default function WeakAreasPage() {
  const { data: weakAreas = [], isLoading } = useWeakAreas();

  return (
    <>
      <Topbar title="Weak Area Analysis" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <Card className="bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-amber-500/10">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg">
                <Target className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {weakAreas.length
                    ? `${weakAreas.length} weak ${weakAreas.length === 1 ? "topic" : "topics"} detected`
                    : "No weak areas yet"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Automatically detected from the questions you miss in quizzes.
                  Each comes with a targeted practice round.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="grid h-40 place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : weakAreas.length === 0 ? (
          <Card>
            <CardContent className="grid h-60 place-items-center text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/10 to-teal-500/10">
                  <ShieldCheck className="h-7 w-7 text-emerald-500" />
                </div>
                <p className="mt-4 text-sm font-medium">No weak areas detected</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                  Take a quiz and I&apos;ll automatically track the topics you
                  struggle with here.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/dashboard/quizzes">Take a quiz</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weakAreas.map((w, i) => {
              const sev = SEVERITY[w.severity] ?? SEVERITY.moderate;
              return (
                <motion.div
                  key={w.topic}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            sev.cls
                          )}
                        >
                          {sev.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ~{w.suggested_minutes} min/day
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">{w.topic}</h3>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Mastery</span>
                        <span className="font-medium">{w.score}%</span>
                      </div>
                      <Progress value={w.score} className="mt-1" />
                      <p className="mt-3 text-xs text-muted-foreground">
                        Last practiced: {timeAgo(w.last_practiced)}
                      </p>
                      <div className="mt-4 rounded-lg border border-brand-500/20 bg-brand-500/5 p-3 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                          Recommended
                        </p>
                        <p className="mt-1 leading-relaxed">
                          {w.recommended_action}
                        </p>
                      </div>
                      <Button asChild className="mt-4 w-full" size="sm">
                        <Link
                          href={`/dashboard/quizzes?topic=${encodeURIComponent(w.topic)}`}
                        >
                          Targeted practice{" "}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
