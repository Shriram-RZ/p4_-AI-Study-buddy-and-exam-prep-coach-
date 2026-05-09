"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Try the AI tutor and basic planner.",
    features: [
      "20 AI tutor messages / day",
      "1 study plan",
      "50 flashcards",
      "Basic progress tracking",
    ],
    cta: "Start free",
    href: "/auth/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    blurb: "Everything you need to crush your next exam.",
    features: [
      "Unlimited AI tutor & quizzes",
      "Unlimited study plans",
      "PDF notes summarizer (50/mo)",
      "Mock tests + deep analytics",
      "Spaced repetition flashcards",
      "Voice tutor + multilingual",
    ],
    cta: "Go Pro",
    href: "/auth/signup",
    highlight: true,
  },
  {
    name: "Campus",
    price: "Custom",
    period: "",
    blurb: "For schools, colleges and coaching institutes.",
    features: [
      "Everything in Pro",
      "Class dashboards",
      "Cohort analytics",
      "SSO & admin controls",
      "Priority support",
    ],
    cta: "Contact sales",
    href: "/auth/signup",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Simple, <span className="gradient-text">student-friendly</span>{" "}
            pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you're ready.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                p.highlight
                  ? "border-2 border-brand-500/40 bg-gradient-to-b from-brand-500/5 to-violet-500/10 shadow-xl shadow-brand-500/10"
                  : "border border-border bg-card"
              }`}
            >
              {p.highlight && (
                <Badge variant="gradient" className="absolute -top-3 left-8">
                  <Zap className="mr-1 h-3 w-3" /> Most popular
                </Badge>
              )}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">
                  {p.period}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
              <Button
                asChild
                className="mt-6 w-full"
                variant={p.highlight ? "default" : "outline"}
              >
                <Link href={p.href}>{p.cta}</Link>
              </Button>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
