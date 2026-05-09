"use client";

import { motion } from "framer-motion";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingUp, BookOpen, Award } from "lucide-react";

const weeklyMins = [40, 65, 80, 50, 110, 95, 120];
const subjectMastery = [
  { name: "Calculus", v: 78 },
  { name: "Physics", v: 62 },
  { name: "Chemistry", v: 85 },
  { name: "Algorithms", v: 71 },
];
const heatmap = Array.from({ length: 7 * 12 }, (_, i) =>
  Math.max(0, Math.round(Math.sin(i / 4) * 2 + 2 + (i % 5 === 0 ? 1 : 0)))
);

export default function ProgressPage() {
  const totalMins = weeklyMins.reduce((a, b) => a + b, 0);
  return (
    <>
      <Topbar title="Progress Analytics" />
      <main className="flex-1 p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <Stat
            icon={<Flame className="h-5 w-5" />}
            label="Streak"
            value="23 days"
            color="from-orange-400 to-pink-500"
          />
          <Stat
            icon={<BookOpen className="h-5 w-5" />}
            label="This week"
            value={`${(totalMins / 60).toFixed(1)} hrs`}
            color="from-brand-500 to-violet-600"
          />
          <Stat
            icon={<TrendingUp className="h-5 w-5" />}
            label="Avg. accuracy"
            value="82%"
            color="from-emerald-400 to-teal-600"
          />
          <Stat
            icon={<Award className="h-5 w-5" />}
            label="Badges earned"
            value="9"
            color="from-amber-400 to-orange-500"
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold">Weekly study minutes</h3>
              <div className="mt-6 grid h-40 grid-cols-7 items-end gap-3">
                {weeklyMins.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(m / 120) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="rounded-t bg-gradient-to-t from-brand-500 to-violet-500"
                    title={`${m}m`}
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 text-center text-xs text-muted-foreground">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold">Mastery by subject</h3>
              <div className="mt-4 space-y-3">
                {subjectMastery.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">{s.v}%</span>
                    </div>
                    <Progress value={s.v} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold">12 weeks of study</h3>
              <div className="mt-4 grid grid-cols-12 gap-1">
                {heatmap.map((v, i) => (
                  <div
                    key={i}
                    className={`h-5 rounded ${
                      [
                        "bg-secondary",
                        "bg-emerald-200",
                        "bg-emerald-300",
                        "bg-emerald-400",
                        "bg-emerald-500",
                      ][Math.min(4, v)]
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                {[
                  "bg-secondary",
                  "bg-emerald-200",
                  "bg-emerald-300",
                  "bg-emerald-400",
                  "bg-emerald-500",
                ].map((c) => (
                  <span key={c} className={`h-3 w-3 rounded ${c}`} />
                ))}
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
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
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div
          className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${color} text-white shadow`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
