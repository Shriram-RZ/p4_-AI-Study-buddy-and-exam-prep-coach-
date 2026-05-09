"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";

const q = {
  question: "Which property does the heap data structure satisfy?",
  options: [
    "Every node ≤ its children (min-heap)",
    "Nodes are stored in alphabetical order",
    "All leaves are at the same depth",
    "It is always balanced like an AVL tree",
  ],
  correct: 0,
  explanation:
    "A min-heap is a complete binary tree where each parent is ≤ its children. Insert/extract are O(log n) — used in priority queues and Dijkstra's algorithm.",
};

export function QuizDemo() {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="glass rounded-3xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Question 4 / 10 · Data Structures
                </span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                  Medium
                </span>
              </div>
              <h3 className="text-lg font-semibold">{q.question}</h3>
              <div className="mt-4 space-y-2">
                {q.options.map((opt, i) => {
                  const isPicked = picked === i;
                  const isCorrect = i === q.correct;
                  const showResult = picked !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => setPicked(i)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        showResult && isCorrect
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : showResult && isPicked && !isCorrect
                            ? "border-rose-500/40 bg-rose-500/10"
                            : "border-border bg-card hover:border-brand-500/40 hover:bg-accent"
                      }`}
                    >
                      <span>{opt}</span>
                      {showResult && isCorrect && (
                        <Check className="h-4 w-4 text-emerald-500" />
                      )}
                      {showResult && isPicked && !isCorrect && (
                        <X className="h-4 w-4 text-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4 text-sm"
                >
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
                    <Sparkles className="h-3 w-3" /> AI explanation
                  </p>
                  {q.explanation}
                </motion.div>
              )}
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" /> AI Quiz
              Generator
            </div>
            <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Practice with quizzes that{" "}
              <span className="gradient-text">grow with you</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The AI generates fresh questions on any topic, explains every
              wrong answer in plain language, and dials difficulty up or
              down based on your accuracy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
