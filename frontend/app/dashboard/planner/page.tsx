"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlans, useCreatePlan } from "@/lib/hooks/useStudy";
import { apiError } from "@/lib/api/client";

export default function PlannerPage() {
  const [form, setForm] = useState({
    exam_name: "",
    exam_date: "",
    daily_hours: 4,
    syllabus: "",
    weak_topics: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: plans = [] } = usePlans();
  const createPlan = useCreatePlan();

  // Show the explicitly selected plan, else the most recent saved one.
  const plan = plans.find((p) => p.id === selectedId) ?? plans[0] ?? null;
  const loading = createPlan.isPending;

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = await createPlan.mutateAsync({
        exam_name: form.exam_name,
        exam_date: form.exam_date,
        daily_hours: Number(form.daily_hours),
        syllabus: form.syllabus,
        weak_topics: form.weak_topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setSelectedId(p.id);
      toast.success("Study plan generated!");
    } catch (err) {
      toast.error(apiError(err, "Could not generate plan"));
    }
  };

  const exportPdf = () => {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Study Plan: ${plan.exam_name}`, 14, 18);
    doc.setFontSize(11);
    doc.text(
      `Exam date: ${plan.exam_date} · Daily hours: ${plan.daily_hours}`,
      14,
      26
    );
    let y = 36;
    plan.schedule.forEach((d) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${d.day} · ${d.date} · ${d.hours}h`, 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      d.topics.forEach((t) => {
        doc.text(`• ${t}`, 18, y);
        y += 5;
      });
      y += 3;
    });
    doc.save(`${plan.exam_name}-study-plan.pdf`);
  };

  return (
    <>
      <Topbar title="Study Planner" />
      <main className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" />
                <h2 className="font-semibold">Build a plan with AI</h2>
              </div>
              <form onSubmit={generate} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Exam name
                  </label>
                  <Input
                    required
                    placeholder="JEE Main 2026"
                    value={form.exam_name}
                    onChange={(e) =>
                      setForm({ ...form, exam_name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Exam date
                    </label>
                    <Input
                      required
                      type="date"
                      value={form.exam_date}
                      onChange={(e) =>
                        setForm({ ...form, exam_date: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Daily hours
                    </label>
                    <Input
                      required
                      type="number"
                      min={1}
                      max={14}
                      value={form.daily_hours}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          daily_hours: Number(e.target.value),
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Syllabus
                  </label>
                  <Textarea
                    required
                    placeholder="Calculus: limits, derivatives, integrals. Physics: optics, thermodynamics. Chemistry: organic chemistry…"
                    value={form.syllabus}
                    onChange={(e) =>
                      setForm({ ...form, syllabus: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Weak topics (comma-separated)
                  </label>
                  <Input
                    placeholder="integration by parts, optics, organic"
                    value={form.weak_topics}
                    onChange={(e) =>
                      setForm({ ...form, weak_topics: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Generate plan
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {plans.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      plan?.id === p.id
                        ? "border-brand-500/40 bg-brand-500/10 text-brand-600"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.exam_name}
                  </button>
                ))}
              </div>
            )}
            {plan ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {plan.exam_name}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {plan.schedule.length} day plan · {plan.daily_hours}
                          h/day
                        </p>
                      </div>
                      <Button
                        onClick={exportPdf}
                        size="sm"
                        variant="outline"
                      >
                        Export PDF
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {plan.schedule.map((d, i) => (
                        <motion.div
                          key={d.day}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="rounded-xl border border-border bg-card/40 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="default">Day {d.day}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {d.date}
                              </span>
                            </div>
                            <span className="text-xs font-medium">
                              {d.hours}h
                            </span>
                          </div>
                          <ul className="space-y-1.5 text-sm">
                            {d.topics.map((t, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                          {d.goals?.length ? (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {d.goals.map((g, k) => (
                                <Badge key={k} variant="secondary">
                                  {g}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card>
                <CardContent className="grid h-full min-h-[420px] place-items-center p-12 text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10">
                      <Calendar className="h-6 w-6 text-brand-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      Tell the AI about your exam
                    </h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                      We'll build a daily study plan, prioritize your weak
                      areas and re-balance as you progress.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
