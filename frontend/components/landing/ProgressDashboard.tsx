"use client";

import { motion } from "framer-motion";
import { Flame, TrendingUp, Trophy } from "lucide-react";

export function ProgressDashboard() {
  const heat = Array.from({ length: 7 * 12 }, (_, i) => (i * 13) % 5);
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Track every step of your{" "}
            <span className="gradient-text">growth</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Streaks, weak-area heatmaps and productivity scores keep you
            motivated and aware.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current streak</p>
                <p className="text-2xl font-bold">23 days</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Beat your record of 19 days. 7 more days to unlock the{" "}
              <span className="font-medium text-foreground">Iron Will</span>{" "}
              badge.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Productivity score
                </p>
                <p className="text-2xl font-bold">87 / 100</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-12 gap-1">
              {heat.map((v, i) => (
                <div
                  key={i}
                  className={`h-3 rounded ${
                    [
                      "bg-secondary",
                      "bg-emerald-200",
                      "bg-emerald-300",
                      "bg-emerald-400",
                      "bg-emerald-500",
                    ][v]
                  }`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              +12% vs. last week
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Weak areas</p>
                <p className="text-2xl font-bold">3 topics</p>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ["Integration by parts", 42],
                ["Wave Optics", 55],
                ["DBMS Normalization", 61],
              ].map(([t, p]) => (
                <li key={t as string}>
                  <div className="flex justify-between text-xs">
                    <span>{t}</span>
                    <span className="text-muted-foreground">{p}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-orange-400"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
