"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Check, X, Trophy } from "lucide-react";
import toast from "react-hot-toast";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { studyApi } from "@/lib/api/study";
import type { Quiz } from "@/lib/types";
import { apiError } from "@/lib/api/client";

type Step = "configure" | "running" | "result";

export default function QuizzesPage() {
  const [step, setStep] = useState<Step>("configure");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [quizType, setQuizType] = useState<
    "mcq" | "fill" | "theory" | "mixed"
  >("mcq");
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    score: number;
    total: number;
    weak_topics: string[];
    review: { question_id: string; correct: boolean; explanation: string }[];
  } | null>(null);

  const generate = async () => {
    if (!topic.trim()) return toast.error("Pick a topic");
    setLoading(true);
    try {
      const q = await studyApi.generateQuiz({
        topic,
        difficulty,
        count,
        type: quizType,
      });
      setQuiz(q);
      setCurrent(0);
      setAnswers({});
      setResult(null);
      setStep("running");
    } catch (err) {
      toast.error(apiError(err, "Could not generate quiz"));
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!quiz) return;
    setLoading(true);
    try {
      const r = await studyApi.submitQuiz(quiz.id, answers);
      setResult(r);
      setStep("result");
    } catch (err) {
      toast.error(apiError(err, "Could not submit"));
    } finally {
      setLoading(false);
    }
  };

  const q = quiz?.questions[current];
  const total = quiz?.questions.length ?? 0;
  const progress = total ? ((current + 1) / total) * 100 : 0;

  return (
    <>
      <Topbar title="Quiz Generator" />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {step === "configure" && (
              <motion.div
                key="cfg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-brand-500" />
                      <h2 className="font-semibold">Generate a quiz</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Topic
                        </label>
                        <Input
                          placeholder="Recursion in DSA"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Difficulty
                          </label>
                          <div className="mt-1 grid grid-cols-3 overflow-hidden rounded-xl border border-border">
                            {(["easy", "medium", "hard"] as const).map((d) => (
                              <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`px-3 py-2 text-sm capitalize transition ${
                                  difficulty === d
                                    ? "bg-gradient-to-r from-brand-500 to-violet-600 text-white"
                                    : "bg-card hover:bg-accent"
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Number of questions
                          </label>
                          <Input
                            type="number"
                            min={3}
                            max={25}
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Question type
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {(
                            [
                              { k: "mcq", label: "Multiple choice" },
                              { k: "fill", label: "Fill blank" },
                              { k: "theory", label: "Short answer" },
                              { k: "mixed", label: "Mixed" },
                            ] as const
                          ).map((t) => (
                            <button
                              key={t.k}
                              onClick={() => setQuizType(t.k)}
                              className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                                quizType === t.k
                                  ? "border-brand-500/50 bg-brand-500/10 text-brand-600"
                                  : "border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={generate}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Generate quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "running" && quiz && q && (
              <motion.div
                key="run"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        Question {current + 1} of {total}
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <Progress value={progress} />
                    <h2 className="mt-6 text-lg font-semibold">{q.question}</h2>
                    <div className="mt-4 space-y-2">
                      {q.type === "mcq" && q.options?.length ? (
                        q.options.map((opt, i) => {
                          const picked = answers[q.id] === String(i);
                          return (
                            <button
                              key={i}
                              onClick={() =>
                                setAnswers({ ...answers, [q.id]: String(i) })
                              }
                              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                                picked
                                  ? "border-brand-500 bg-brand-500/10"
                                  : "border-border bg-card hover:border-brand-500/40 hover:bg-accent"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })
                      ) : (
                        <Input
                          autoFocus
                          placeholder="Type your answer…"
                          value={answers[q.id] ?? ""}
                          onChange={(e) =>
                            setAnswers({ ...answers, [q.id]: e.target.value })
                          }
                        />
                      )}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                        disabled={current === 0}
                      >
                        Previous
                      </Button>
                      {current < total - 1 ? (
                        <Button
                          onClick={() =>
                            setCurrent((c) => Math.min(total - 1, c + 1))
                          }
                          disabled={!answers[q.id]}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          onClick={submit}
                          disabled={loading || !answers[q.id]}
                        >
                          {loading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Submit quiz
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
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="grid place-items-center pb-4">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                        <Trophy className="h-8 w-8" />
                      </div>
                      <h2 className="mt-3 text-2xl font-bold">
                        {result.score}/{result.total}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((result.score / result.total) * 100)}%
                        accuracy
                      </p>
                    </div>

                    <Progress
                      value={(result.score / result.total) * 100}
                      className="mb-6"
                    />

                    {result.weak_topics.length > 0 && (
                      <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                          Suggested focus
                        </p>
                        <p className="mt-1 text-sm">
                          You missed questions on:{" "}
                          {result.weak_topics.join(", ")}. Consider a
                          targeted practice round.
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {quiz.questions.map((q, i) => {
                        const r = result.review.find(
                          (x) => x.question_id === q.id
                        );
                        return (
                          <div
                            key={q.id}
                            className="rounded-xl border border-border bg-card/40 p-4"
                          >
                            <div className="flex items-start gap-2">
                              {r?.correct ? (
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              ) : (
                                <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {i + 1}. {q.question}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {r?.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep("configure")}
                      >
                        New quiz
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={async () => {
                          setStep("configure");
                          setTopic(quiz.topic);
                          setDifficulty(quiz.difficulty);
                          await generate();
                        }}
                      >
                        Retry similar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
