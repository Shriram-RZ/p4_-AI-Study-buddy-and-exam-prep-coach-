"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Target, ArrowRight } from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const weakAreas = [
  {
    topic: "Integration by parts",
    subject: "Calculus",
    score: 42,
    last: "2 days ago",
    tip: "Use the LIATE rule to pick u; practice with x·sin(x), ln(x)·x²",
  },
  {
    topic: "Wave Optics",
    subject: "Physics",
    score: 55,
    last: "Yesterday",
    tip: "Re-derive single & double-slit equations from scratch",
  },
  {
    topic: "DBMS Normalization",
    subject: "CS",
    score: 61,
    last: "3 days ago",
    tip: "Walk through 1NF → 2NF → 3NF on the school enrollment example",
  },
];

export default function WeakAreasPage() {
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
                <h2 className="text-lg font-semibold">3 weak topics detected</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Based on your last 7 quizzes, the AI flagged these
                  concepts. Targeted 30-minute practice rounds are ready.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {weakAreas.map((w, i) => (
            <motion.div
              key={w.topic}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {w.subject}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{w.topic}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="font-medium">{w.score}%</span>
                  </div>
                  <Progress value={w.score} className="mt-1" />
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last practiced: {w.last}
                  </p>
                  <div className="mt-4 rounded-lg border border-brand-500/20 bg-brand-500/5 p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                      AI tip
                    </p>
                    <p className="mt-1 leading-relaxed">{w.tip}</p>
                  </div>
                  <Button asChild className="mt-4 w-full" size="sm">
                    <Link href="/dashboard/quizzes">
                      Targeted practice <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </>
  );
}
