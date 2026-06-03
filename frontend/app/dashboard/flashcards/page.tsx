"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Loader2, Sparkles, RotateCcw, Flame, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useFlashcards,
  useFlashcardStats,
  useGenerateFlashcards,
  useReviewFlashcard,
} from "@/lib/hooks/useFlashcards";
import type { Flashcard } from "@/lib/types";
import { apiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type Deck = "due" | "all" | "mastered";

// SM-2 quality mapping (Again < 3 resets the card server-side).
const GRADES = [
  { label: "Again", quality: 1, cls: "border-rose-300 text-rose-600 hover:bg-rose-500/10" },
  { label: "Hard", quality: 3, cls: "border-amber-300 text-amber-600 hover:bg-amber-500/10" },
  { label: "Good", quality: 4, cls: "border-sky-300 text-sky-600 hover:bg-sky-500/10" },
  { label: "Easy", quality: 5, cls: "border-emerald-300 text-emerald-600 hover:bg-emerald-500/10" },
];

export default function FlashcardsPage() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [deck, setDeck] = useState<Deck>("due");

  const { data: cards = [], isLoading } = useFlashcards(deck);
  const { data: stats } = useFlashcardStats();
  const gen = useGenerateFlashcards();
  const reviewMut = useReviewFlashcard();

  // Local review session, seeded whenever a fresh list arrives (deck switch or
  // after generating). Reviews don't refetch the list, so it's stable mid-run.
  const [session, setSession] = useState<Flashcard[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setSession(cards);
    setPos(0);
    setFlipped(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const generate = async () => {
    if (!topic.trim()) return toast.error("Pick a topic");
    try {
      const c = await gen.mutateAsync({ topic, count });
      setDeck("due");
      toast.success(`${c.length} flashcards ready`);
    } catch (err) {
      toast.error(apiError(err, "Could not generate"));
    }
  };

  const onReview = (quality: number) => {
    const card = session[pos];
    if (!card) return;
    reviewMut.mutate({ id: card.id, quality });
    setFlipped(false);
    setPos((p) => p + 1);
  };

  const card = session[pos];
  const done = session.length > 0 && pos >= session.length;
  const maxDaily = Math.max(1, ...(stats?.daily_reviews.map((d) => d.count) ?? [1]));

  return (
    <>
      <Topbar title="Flashcards" />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Analytics */}
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat icon={<Layers className="h-4 w-4" />} label="Due today" value={stats?.due ?? 0} color="from-brand-500 to-violet-600" />
            <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Mastered" value={stats?.mastered ?? 0} color="from-emerald-400 to-teal-600" />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Retention" value={`${stats?.retention_rate ?? 0}%`} color="from-sky-400 to-blue-600" />
            <Stat icon={<Flame className="h-4 w-4" />} label="Review streak" value={`${stats?.review_streak ?? 0}d`} color="from-orange-400 to-pink-500" />
          </div>

          {stats && stats.total_reviews > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground">
                  Reviews · last 7 days
                </p>
                <div className="mt-3 grid h-20 grid-cols-7 items-end gap-2">
                  {stats.daily_reviews.map((d) => (
                    <div key={d.date} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-brand-500 to-violet-500"
                        style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: d.count ? 4 : 0 }}
                        title={`${d.count} reviews`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(d.date).toLocaleDateString(undefined, { weekday: "narrow" })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate */}
          <Card>
            <CardContent className="flex flex-wrap items-end gap-3 p-6">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground">Topic</label>
                <Input placeholder="Photosynthesis" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1" />
              </div>
              <div className="w-28">
                <label className="text-xs font-medium text-muted-foreground">Count</label>
                <Input type="number" min={5} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-1" />
              </div>
              <Button onClick={generate} disabled={gen.isPending}>
                {gen.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </Button>
            </CardContent>
          </Card>

          {/* Deck selector */}
          <div className="flex gap-2">
            {(["due", "all", "mastered"] as Deck[]).map((d) => (
              <button
                key={d}
                onClick={() => setDeck(d)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium capitalize transition",
                  deck === d
                    ? "border-brand-500/40 bg-brand-500/10 text-brand-600"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {d}{d === "due" && stats?.due ? ` (${stats.due})` : ""}
              </button>
            ))}
          </div>

          {/* Review session */}
          {isLoading ? (
            <Card><CardContent className="grid h-72 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></CardContent></Card>
          ) : card ? (
            <div>
              <p className="mb-3 text-center text-xs text-muted-foreground">
                Card {pos + 1} of {session.length} · {card.topic} · click to flip
              </p>
              <div className="relative h-72 cursor-pointer">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${card.id}-${flipped}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    onClick={() => setFlipped((f) => !f)}
                    className={cn(
                      "flex h-full items-center justify-center rounded-3xl border border-border p-8 text-center shadow-lg",
                      flipped ? "bg-gradient-to-br from-brand-500 to-violet-600 text-white" : "bg-card"
                    )}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-70">{flipped ? "Answer" : "Question"}</p>
                      <p className="mt-3 text-xl font-semibold leading-relaxed">{flipped ? card.back : card.front}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4">
                {flipped ? (
                  <div className="grid grid-cols-4 gap-2">
                    {GRADES.map((g) => (
                      <Button key={g.label} variant="outline" className={g.cls} onClick={() => onReview(g.quality)}>
                        {g.label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button className="w-full" onClick={() => setFlipped(true)}>
                    <RotateCcw className="h-4 w-4" /> Reveal answer
                  </Button>
                )}
              </div>
            </div>
          ) : done ? (
            <Card>
              <CardContent className="grid h-72 place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">Session complete! 🎉</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You reviewed {session.length} card{session.length === 1 ? "" : "s"}.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="grid h-72 place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                    <Layers className="h-6 w-6 text-cyan-500" />
                  </div>
                  <p className="mt-4 text-sm font-medium">
                    {deck === "due" ? "Nothing due — you're all caught up!" : "No cards here yet"}
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Pick a topic above and the AI will generate spaced-repetition flashcards.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
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
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${color} text-white`}>{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
