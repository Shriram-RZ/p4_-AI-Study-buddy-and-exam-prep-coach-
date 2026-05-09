"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  BookOpen,
  Target,
  Clock,
  Flame,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-20 md:pt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <Badge variant="gradient" className="mb-5 px-3 py-1">
                <Flame className="mr-1.5 h-3.5 w-3.5" />
                Powered by Gemini Flash
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              Your Personal{" "}
              <span className="gradient-text">AI Study Coach</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl"
            >
              Learn faster. Revise smarter. Score higher. An AI-native
              workspace that builds your study plan, summarizes notes,
              generates quizzes & flashcards, and tutors you 24/7.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
            >
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Start learning free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass">
                <a href="#tutor">
                  <PlayCircle className="h-4 w-4" /> See it in action
                </a>
              </Button>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-brand-500" /> Adaptive AI tutor
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-violet-500" /> Smart
                summaries
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-pink-500" /> Weak-area focus
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-500" /> Spaced
                repetition
              </span>
            </motion.div>
          </div>

          <div className="relative">
            <FloatingCards />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCards() {
  return (
    <div className="relative h-[520px] w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="glass absolute left-0 top-6 w-[88%] rounded-2xl p-5 shadow-xl glow-brand"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          AI Tutor · streaming
        </div>
        <p className="mt-3 text-sm leading-relaxed">
          <span className="font-medium">Recursion</span> is when a function
          calls itself with a smaller version of the same problem. Picture a
          set of Russian dolls — each one contains a slightly smaller copy.
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute right-0 top-32 w-[72%] animate-float rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 p-5 text-white shadow-2xl shadow-violet-500/30"
      >
        <div className="flex items-center justify-between text-xs font-medium opacity-90">
          <span>Today's plan</span>
          <span>4h 15m</span>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {[
            { t: "Calculus · Limits", d: "60m", on: true },
            { t: "Physics · Optics", d: "45m", on: true },
            { t: "DSA · Recursion", d: "90m", on: false },
            { t: "Revise flashcards", d: "20m", on: false },
          ].map((x) => (
            <div
              key={x.t}
              className="flex items-center justify-between rounded-lg bg-white/15 px-3 py-2 backdrop-blur"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${x.on ? "bg-emerald-300" : "bg-white/40"}`}
                />
                <span>{x.t}</span>
              </div>
              <span className="text-xs opacity-80">{x.d}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="glass absolute bottom-0 left-8 w-[70%] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold">
              23 <span className="text-base">days</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg">
            <Flame className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className={`h-6 rounded-md ${
                i % 5 === 2
                  ? "bg-emerald-200"
                  : i % 3 === 0
                    ? "bg-emerald-400"
                    : "bg-emerald-500"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
