"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Which AI model powers StudyBuddy?",
    a: "We use Google's Gemini Flash for fast, accurate, education-tuned responses. The tutor streams answers in real-time and is heavily prompted to teach, not just answer.",
  },
  {
    q: "Can I upload my own notes and PDFs?",
    a: "Yes. Drop a PDF or paste text into the Notes Summarizer. The AI extracts key points, generates flashcards, and ties topics back into your study plan.",
  },
  {
    q: "Does the planner adapt if I miss a day?",
    a: "Absolutely. The planner re-balances after you fall behind, prioritizes weak topics, and protects core revision blocks before your exam.",
  },
  {
    q: "Is my data private?",
    a: "Your notes and uploads are stored encrypted, scoped to your account, and never used to train external models.",
  },
  {
    q: "Can the AI quiz me and track my weak areas?",
    a: "Yes. The Quiz Generator creates fresh questions at adaptive difficulty, scores you instantly, and automatically logs weak topics so your planner and revision schedule can prioritize them.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="font-medium">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 text-sm text-muted-foreground">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
