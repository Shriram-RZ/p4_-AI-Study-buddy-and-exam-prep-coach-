"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Loader2, Sparkles, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { studyApi } from "@/lib/api/study";
import type { Flashcard } from "@/lib/types";
import { apiError } from "@/lib/api/client";

export default function FlashcardsPage() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return toast.error("Pick a topic");
    setLoading(true);
    try {
      const c = await studyApi.generateFlashcards(topic, count);
      setCards(c);
      setIdx(0);
      setFlipped(false);
      toast.success(`${c.length} flashcards ready`);
    } catch (err) {
      toast.error(apiError(err, "Could not generate"));
    } finally {
      setLoading(false);
    }
  };

  const review = async (quality: number) => {
    const card = cards[idx];
    if (!card) return;
    try {
      await studyApi.reviewFlashcard(card.id, quality);
    } catch {}
    setFlipped(false);
    setIdx((i) => (i + 1) % cards.length);
  };

  const card = cards[idx];

  return (
    <>
      <Topbar title="Flashcards" />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <Card className="mb-6">
            <CardContent className="flex flex-wrap items-end gap-3 p-6">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground">
                  Topic
                </label>
                <Input
                  placeholder="Photosynthesis"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-32">
                <label className="text-xs font-medium text-muted-foreground">
                  Count
                </label>
                <Input
                  type="number"
                  min={5}
                  max={30}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <Button onClick={generate} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate
              </Button>
            </CardContent>
          </Card>

          {card ? (
            <div>
              <p className="mb-3 text-center text-xs text-muted-foreground">
                Card {idx + 1} of {cards.length} · click to flip
              </p>
              <div className="relative h-72 cursor-pointer perspective-1000">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${idx}-${flipped}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    onClick={() => setFlipped((f) => !f)}
                    className={`flex h-full items-center justify-center rounded-3xl border border-border p-8 text-center shadow-lg ${
                      flipped
                        ? "bg-gradient-to-br from-brand-500 to-violet-600 text-white"
                        : "bg-card"
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-70">
                        {flipped ? "Answer" : "Question"}
                      </p>
                      <p className="mt-3 text-xl font-semibold leading-relaxed">
                        {flipped ? card.back : card.front}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipped((f) => !f)}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Flip
                </Button>
                {flipped ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-rose-300 text-rose-600 hover:bg-rose-500/10"
                      onClick={() => review(1)}
                    >
                      Hard
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 text-amber-600 hover:bg-amber-500/10"
                      onClick={() => review(3)}
                    >
                      Good
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => review(5)}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Easy
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setFlipped(true)}>
                    Reveal answer
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="grid h-72 place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                    <Layers className="h-6 w-6 text-cyan-500" />
                  </div>
                  <p className="mt-4 text-sm font-medium">No cards yet</p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Pick a topic and the AI will generate spaced-repetition
                    flashcards.
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
