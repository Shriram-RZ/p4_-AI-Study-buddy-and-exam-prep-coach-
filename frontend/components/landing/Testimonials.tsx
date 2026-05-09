"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const items = [
  {
    name: "Aarav P.",
    role: "JEE Aspirant · 12th Grade",
    body: "I jumped from rank 18,400 to 4,210 in 3 months. The weak-area engine is unreal — it knew I struggled with integration before I did.",
  },
  {
    name: "Mei L.",
    role: "Med School · Year 2",
    body: "The notes summarizer turns 60-page PDFs into 6 minutes of revision. I literally cannot study without it now.",
  },
  {
    name: "Daniel R.",
    role: "CS Undergrad",
    body: "It's like having a TA who's available at 3 AM and never gets tired of my dumb questions. The streaks keep me locked in.",
  },
  {
    name: "Priya S.",
    role: "GMAT · 760",
    body: "The mock tests are spookily realistic. The post-test analytics showed me exactly which question types were costing me points.",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Students <span className="gradient-text">love</span> StudyBuddy
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed">"{t.body}"</p>
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
