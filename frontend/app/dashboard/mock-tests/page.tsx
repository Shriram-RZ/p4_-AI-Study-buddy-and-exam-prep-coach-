"use client";

import Link from "next/link";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

const mocks = [
  {
    name: "JEE Main · Full Syllabus",
    questions: 75,
    duration: "180m",
    difficulty: "Hard",
    last_score: 78,
  },
  {
    name: "Physics · Mechanics + Optics",
    questions: 30,
    duration: "60m",
    difficulty: "Medium",
    last_score: 65,
  },
  {
    name: "DSA · Arrays + Recursion",
    questions: 20,
    duration: "45m",
    difficulty: "Medium",
    last_score: 82,
  },
];

export default function MockTestsPage() {
  return (
    <>
      <Topbar title="Mock Tests" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <Card className="bg-gradient-to-br from-brand-500/10 to-violet-500/10">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  Train under real exam conditions
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Timed, AI-graded simulations with concept-level analytics.
                  After each test the AI explains every wrong answer and
                  drafts a remedial plan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mocks.map((m) => (
            <Card key={m.name}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold leading-tight">
                    {m.name}
                  </h3>
                  <Badge variant="secondary" className="capitalize">
                    {m.difficulty}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {m.questions} Qs
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {m.duration}
                  </span>
                </div>
                <div className="mt-4 rounded-lg border border-border bg-card/40 p-3 text-xs">
                  <span className="text-muted-foreground">Last score:</span>{" "}
                  <span className="font-semibold">{m.last_score}%</span>
                </div>
                <Button asChild className="mt-4 w-full">
                  <Link href="/dashboard/quizzes">
                    Start mock <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
