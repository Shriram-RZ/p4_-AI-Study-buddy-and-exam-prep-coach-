"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { studyApi } from "@/lib/api/study";
import { apiError } from "@/lib/api/client";
import type { Quiz } from "@/lib/types";

type Preset = {
  id: string;
  name: string;
  topic: string;
  sections: string[];
  questions: number;
  durationMin: number;
  difficulty: "easy" | "medium" | "hard";
};

type Step = "select" | "running" | "result";

const PRESETS: Preset[] = [
  {
    id: "exam-core",
    name: "Core Exam Readiness",
    topic: "Mixed exam readiness: formulas, core concepts, reasoning, common traps",
    sections: ["Concepts", "Application", "Common traps"],
    questions: 10,
    durationMin: 18,
    difficulty: "medium",
  },
  {
    id: "physics",
    name: "Physics Sprint",
    topic: "Physics mechanics, waves, optics, and electromagnetism",
    sections: ["Mechanics", "Waves", "Optics"],
    questions: 8,
    durationMin: 14,
    difficulty: "medium",
  },
  {
    id: "cs",
    name: "CS Problem Solving",
    topic: "Data structures, algorithms, recursion, databases, and operating systems",
    sections: ["Algorithms", "DBMS", "Operating Systems"],
    questions: 8,
    durationMin: 14,
    difficulty: "hard",
  },
];

export default function MockTestsPage() {
  const [step, setStep] = useState<Step>("select");
  const [preset, setPreset] = useState<Preset | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    weak_topics: string[];
    review: { question_id: string; correct: boolean; explanation: string }[];
  } | null>(null);

  const currentQuestion = quiz?.questions[current];
  const progress = quiz?.questions.length
    ? ((current + 1) / quiz.questions.length) * 100
    : 0;

  const reviewById = useMemo(() => {
    const map = new Map<string, { correct: boolean; explanation: string }>();
    result?.review.forEach((item) =>
      map.set(item.question_id, {
        correct: item.correct,
        explanation: item.explanation,
      })
    );
    return map;
  }, [result]);

  const topicRanking = useMemo(() => {
    if (!quiz || !result) return [];
    const buckets = new Map<string, { missed: number; total: number }>();
    for (const q of quiz.questions) {
      const topic = q.topic_tag || preset?.name || quiz.topic;
      const row = buckets.get(topic) ?? { missed: 0, total: 0 };
      row.total += 1;
      if (!reviewById.get(q.id)?.correct) row.missed += 1;
      buckets.set(topic, row);
    }
    return [...buckets.entries()]
      .map(([topic, row]) => ({
        topic,
        missed: row.missed,
        total: row.total,
        severity: row.total ? Math.round((row.missed / row.total) * 100) : 0,
      }))
      .sort((a, b) => b.severity - a.severity);
  }, [preset?.name, quiz, result, reviewById]);

  useEffect(() => {
    if (step !== "running" || !quiz || result) return;
    if (secondsLeft <= 0) {
      void submit(true);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [quiz, result, secondsLeft, step]);

  const start = async (nextPreset: Preset) => {
    setLoading(true);
    try {
      const generated = await studyApi.generateQuiz({
        topic: `${nextPreset.topic}. Return questions that span these sections: ${nextPreset.sections.join(", ")}.`,
        difficulty: nextPreset.difficulty,
        count: nextPreset.questions,
        type: "mcq",
      });
      setPreset(nextPreset);
      setQuiz(generated);
      setCurrent(0);
      setAnswers({});
      setResult(null);
      setSecondsLeft(nextPreset.durationMin * 60);
      setStep("running");
      toast.success("Mock test generated");
    } catch (err) {
      toast.error(apiError(err, "Could not start mock test"));
    } finally {
      setLoading(false);
    }
  };

  const submit = async (auto = false) => {
    if (!quiz || result || loading) return;
    setLoading(true);
    try {
      const scored = await studyApi.submitQuiz(quiz.id, answers);
      setResult(scored);
      setStep("result");
      if (auto) toast("Time is up. Your test was submitted.");
    } catch (err) {
      toast.error(apiError(err, "Could not submit mock test"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("select");
    setPreset(null);
    setQuiz(null);
    setCurrent(0);
    setAnswers({});
    setResult(null);
    setSecondsLeft(0);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <>
      <Topbar title="Mock Tests" />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            {step === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card className="mb-6 bg-gradient-to-br from-brand-500/10 to-violet-500/10">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">
                        Train under exam conditions
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Generate a timed test, answer under pressure, then review
                        ranked weak topics and suggested revision.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {PRESETS.map((mock) => (
                    <Card key={mock.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold leading-tight">
                            {mock.name}
                          </h3>
                          <Badge variant="secondary" className="capitalize">
                            {mock.difficulty}
                          </Badge>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {mock.questions} Qs
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {mock.durationMin}m
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {mock.sections.map((section) => (
                            <Badge key={section} variant="outline">
                              {section}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          className="mt-5 w-full"
                          disabled={loading}
                          onClick={() => start(mock)}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                          Start timed mock
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "running" && quiz && currentQuestion && (
              <motion.div
                key="running"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {preset?.name}
                        </p>
                        <h2 className="text-lg font-semibold">
                          Question {current + 1} of {quiz.questions.length}
                        </h2>
                      </div>
                      <Badge
                        variant={secondsLeft < 120 ? "warning" : "secondary"}
                        className="gap-1"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {minutes}:{seconds}
                      </Badge>
                    </div>
                    <Progress value={progress} />

                    <div className="mt-6 rounded-xl border border-border bg-card/50 p-5">
                      <Badge variant="outline">
                        {currentQuestion.topic_tag || "Mock section"}
                      </Badge>
                      <h3 className="mt-3 text-lg font-semibold leading-relaxed">
                        {currentQuestion.question}
                      </h3>
                      <div className="mt-5 grid gap-3">
                        {(currentQuestion.options ?? []).map((option, i) => {
                          const selected =
                            answers[currentQuestion.id] === String(i);
                          return (
                            <button
                              key={option}
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [currentQuestion.id]: String(i),
                                }))
                              }
                              className={`rounded-xl border p-4 text-left text-sm transition ${
                                selected
                                  ? "border-brand-500 bg-brand-500/10"
                                  : "border-border hover:bg-accent"
                              }`}
                            >
                              <span className="mr-2 font-semibold">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <Button
                        variant="outline"
                        disabled={current === 0}
                        onClick={() => setCurrent((i) => Math.max(0, i - 1))}
                      >
                        Previous
                      </Button>
                      {current < quiz.questions.length - 1 ? (
                        <Button
                          onClick={() =>
                            setCurrent((i) =>
                              Math.min(quiz.questions.length - 1, i + 1)
                            )
                          }
                        >
                          Next
                        </Button>
                      ) : (
                        <Button onClick={() => submit()} disabled={loading}>
                          {loading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Submit test
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "result" && quiz && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Mock complete
                        </p>
                        <h2 className="text-2xl font-bold">
                          {result.score}/{result.total} correct
                        </h2>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-brand-600">
                          {Math.round((result.score / result.total) * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          overall score
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-3">
                  <Card className="lg:col-span-1">
                    <CardContent className="p-6">
                      <h3 className="font-semibold">Topic ranking</h3>
                      <div className="mt-4 space-y-3">
                        {topicRanking.map((topic) => (
                          <div key={topic.topic}>
                            <div className="mb-1 flex justify-between gap-3 text-xs">
                              <span className="truncate">{topic.topic}</span>
                              <span className="text-muted-foreground">
                                {topic.missed}/{topic.total} missed
                              </span>
                            </div>
                            <Progress value={topic.severity} />
                          </div>
                        ))}
                      </div>
                      {topicRanking[0]?.missed ? (
                        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm">
                          <p className="font-semibold text-amber-700 dark:text-amber-300">
                            Recommended adjustment
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            Spend 30 minutes on {topicRanking[0].topic}, then
                            generate a focused quiz before your next mock.
                          </p>
                        </div>
                      ) : null}
                      <Button
                        variant="outline"
                        className="mt-5 w-full"
                        onClick={reset}
                      >
                        <RotateCcw className="h-4 w-4" />
                        New mock
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                      <h3 className="font-semibold">Review mode</h3>
                      <div className="mt-4 space-y-3">
                        {quiz.questions.map((q, i) => {
                          const row = reviewById.get(q.id);
                          const chosen = answers[q.id];
                          return (
                            <div
                              key={q.id}
                              className="rounded-xl border border-border p-4"
                            >
                              <div className="flex items-start gap-3">
                                {row?.correct ? (
                                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                                ) : (
                                  <XCircle className="mt-1 h-4 w-4 shrink-0 text-rose-500" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">
                                    {i + 1}. {q.question}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Your answer:{" "}
                                    {chosen !== undefined && q.options?.[Number(chosen)]
                                      ? q.options[Number(chosen)]
                                      : "No answer"}
                                  </p>
                                  {!row?.correct ? (
                                    <p className="mt-1 text-xs text-emerald-600">
                                      Correct:{" "}
                                      {q.options?.[Number(q.correct_answer)] ??
                                        q.correct_answer}
                                    </p>
                                  ) : null}
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {row?.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
