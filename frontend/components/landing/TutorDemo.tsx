"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, User } from "lucide-react";

const reply =
  "Great question! Think of recursion as a function asking itself for help with a smaller version of the same problem.\n\nBase case → when to stop.\nRecursive case → call itself with a simpler input.\n\nExample (factorial):\n  fact(n) = n × fact(n-1), and fact(0) = 1.\n\nWant me to draw a call stack visualization?";

export function TutorDemo() {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setTyped(reply.slice(0, i));
      if (i >= reply.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="tutor" className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-pink-500" /> AI Tutor
          </div>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Stuck? Ask anything,{" "}
            <span className="gradient-text">get it explained</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass mt-12 overflow-hidden rounded-3xl"
        >
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5 text-sm">
                Explain recursion simply with an example
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-500/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-gradient-to-br from-brand-50 to-violet-50 px-4 py-3 text-sm leading-relaxed dark:from-brand-500/10 dark:to-violet-500/10">
                <pre className="whitespace-pre-wrap font-sans">{typed}</pre>
                <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-brand-500" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-border bg-card/50 p-3">
            <input
              disabled
              placeholder="Ask anything — math, code, history…"
              className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-white">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
