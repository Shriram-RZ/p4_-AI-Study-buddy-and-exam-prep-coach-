"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Flame, TrendingUp, BookOpen, Award, Loader2 } from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/lib/hooks/useStudy";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "numeric", day: "numeric" });

export default function ProgressPage() {
  const { data, isLoading } = useAnalytics();
  const s = data?.summary;

  return (
    <>
      <Topbar title="Progress Analytics" />
      <main className="flex-1 p-6">
        {isLoading ? (
          <div className="grid h-64 place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-4">
              <Stat icon={<Flame className="h-5 w-5" />} label="Streak" value={`${s?.streak ?? 0} days`} color="from-orange-400 to-pink-500" />
              <Stat icon={<TrendingUp className="h-5 w-5" />} label="Avg. accuracy" value={`${s?.avg_accuracy ?? 0}%`} color="from-emerald-400 to-teal-600" />
              <Stat icon={<BookOpen className="h-5 w-5" />} label="Quizzes taken" value={s?.quizzes_taken ?? 0} color="from-brand-500 to-violet-600" />
              <Stat icon={<Award className="h-5 w-5" />} label="Mastered cards" value={s?.mastered_cards ?? 0} color="from-amber-400 to-orange-500" />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold">Quiz accuracy trend</h3>
                  {data?.quiz_accuracy.length ? (
                    <ResponsiveContainer width="100%" height={220} className="mt-4">
                      <LineChart data={data.quiz_accuracy} margin={{ left: -20, right: 8, top: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tickFormatter={fmtDate} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                        <YAxis domain={[0, 100]} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                        <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--brand-500, 139 92 246))" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty msg="Take a few quizzes to see your accuracy trend." />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold">Activity · last 14 days</h3>
                  {data?.daily.some((d) => d.activities || d.reviews) ? (
                    <ResponsiveContainer width="100%" height={220} className="mt-4">
                      <BarChart data={data.daily} margin={{ left: -20, right: 8, top: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tickFormatter={fmtDate} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                        <YAxis allowDecimals={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                        <Bar dataKey="activities" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="reviews" stackId="a" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty msg="Your study activity will chart here as you use the app." />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold">Topic mastery</h3>
                  {data?.topic_mastery.length ? (
                    <div className="mt-4 space-y-3">
                      {data.topic_mastery.map((t) => (
                        <div key={t.topic}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="truncate pr-2">{t.topic}</span>
                            <span className="text-muted-foreground">{t.mastery}%</span>
                          </div>
                          <Progress value={t.mastery} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty msg="Mastery appears here once quizzes start tracking your topics." />
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="grid h-[180px] place-items-center text-center text-sm text-muted-foreground">
      {msg}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${color} text-white shadow`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
