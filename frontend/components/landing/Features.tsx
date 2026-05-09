"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  FileText,
  Sparkles,
  TrendingUp,
  Layers,
  Mic,
  Map,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Tutor",
    desc: "24/7 personalized tutor that explains concepts at your level — with examples, analogies, and step-by-step breakdowns.",
    color: "from-brand-500 to-violet-600",
  },
  {
    icon: Calendar,
    title: "Smart Study Planner",
    desc: "AI-generated daily plan from your syllabus, exam date, and weak topics. Adapts as you progress.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "Notes Summarizer",
    desc: "Drop a PDF or paste notes. Get crisp summaries, key bullet points, and revision-ready cards instantly.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Sparkles,
    title: "Quiz Generator",
    desc: "Auto-generate MCQs, fill-in-the-blanks and theory tests. Adaptive difficulty after every attempt.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: Layers,
    title: "Flashcards + SRS",
    desc: "Spaced repetition that schedules each card by your memory strength — proven to boost retention 3x.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Weak Area Analysis",
    desc: "AI tracks every mistake, finds patterns, and builds targeted practice for your weakest concepts.",
    color: "from-violet-500 to-fuchsia-600",
  },
  {
    icon: Trophy,
    title: "Mock Tests",
    desc: "Timed, exam-grade simulations with deep performance analytics and concept-level breakdowns.",
    color: "from-yellow-500 to-orange-600",
  },
  {
    icon: Map,
    title: "Mind Maps & Roadmaps",
    desc: "AI-generated mind maps for any topic and a career roadmap tailored to your goals.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    icon: Mic,
    title: "Voice & Multilingual",
    desc: "Talk to your tutor and learn in your preferred language. Native voice experience built-in.",
    color: "from-rose-500 to-red-600",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-balance text-4xl font-bold tracking-tight md:text-5xl"
          >
            Everything you need to{" "}
            <span className="gradient-text">learn smarter</span>
          </motion.h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One AI workspace replaces the dozen apps you've been juggling.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-xl"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg`}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/0 to-violet-500/0 blur-2xl transition-all group-hover:from-brand-500/20 group-hover:to-violet-500/20" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
