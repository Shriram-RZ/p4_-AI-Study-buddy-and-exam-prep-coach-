"use client";

import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Sparkles } from "lucide-react";

const days = [
  {
    d: "Mon",
    items: [
      { t: "Calculus · Limits & Continuity", h: "1h", done: true },
      { t: "Physics · Wave Optics", h: "45m", done: true },
      { t: "Revise: 12 flashcards", h: "20m", done: true },
    ],
  },
  {
    d: "Tue",
    items: [
      { t: "Calculus · Derivatives Practice", h: "1h", done: true },
      { t: "Chemistry · Thermodynamics", h: "1h", done: false },
      { t: "Mock test (30 Qs)", h: "30m", done: false },
    ],
  },
  {
    d: "Wed",
    items: [
      { t: "Weak topic: Integration by parts", h: "1h", done: false },
      { t: "Physics · Modern Physics", h: "45m", done: false },
      { t: "Flashcard SRS review", h: "15m", done: false },
    ],
  },
];

export function PlannerDemo() {
  return (
    <section id="planner" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" /> AI Study
              Planner
            </div>
            <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
              A study plan that{" "}
              <span className="gradient-text">adapts to you</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tell the AI your exam date, syllabus and free hours. It builds
              a daily plan, prioritizes weak topics and re-balances when you
              fall behind.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Auto-prioritized topics by importance × difficulty",
                "Re-plans when you miss a day or ace a topic",
                "Pomodoro-aware breaks & focus blocks",
                "Exam countdown with revision phases",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-brand-500" /> This week
              </div>
              <span className="text-xs text-muted-foreground">
                JEE · 47 days left
              </span>
            </div>
            <div className="space-y-3">
              {days.map((d, i) => (
                <motion.div
                  key={d.d}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-xl border border-border bg-card/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>{d.d}</span>
                    <span>
                      {d.items.filter((i) => i.done).length}/{d.items.length}{" "}
                      done
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {d.items.map((it) => (
                      <div
                        key={it.t}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${it.done ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                          />
                          <span
                            className={
                              it.done
                                ? "text-muted-foreground line-through"
                                : ""
                            }
                          >
                            {it.t}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {it.h}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
