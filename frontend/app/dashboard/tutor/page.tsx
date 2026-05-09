"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, User, Square } from "lucide-react";
import toast from "react-hot-toast";

import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { studyApi } from "@/lib/api/study";
import type { ChatMessage } from "@/lib/types";
import { apiError } from "@/lib/api/client";

const STARTERS = [
  "Explain recursion simply with an example",
  "Summarize Newton's Laws for revision",
  "Quiz me on integration techniques",
  "Help me revise for tomorrow's exam",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const stopRef = useRef<null | (() => void)>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    const assistantId = `a-${Date.now()}`;
    setMessages((m) => [
      ...m,
      userMsg,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      },
    ]);
    setInput("");
    setStreaming(true);

    const stop = studyApi.chatStream(
      trimmed,
      messages,
      (chunk) => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      },
      () => setStreaming(false),
      (err) => {
        toast.error(apiError(err, "AI tutor unavailable"));
        setStreaming(false);
      }
    );
    stopRef.current = stop;
  };

  const cancel = () => {
    stopRef.current?.();
    setStreaming(false);
  };

  return (
    <>
      <Topbar title="AI Tutor" />
      <main className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-xl shadow-brand-500/30">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Your AI tutor is ready
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask anything — concepts, formulas, code, revision plans.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-xl border border-border bg-card p-3 text-left text-sm transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 shadow shadow-brand-500/30">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-brand-500 to-violet-600 text-white"
                        : "rounded-tl-sm border border-border bg-card"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      msg.content ? (
                        <article className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-pre:rounded-lg prose-code:rounded prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:before:content-[''] prose-code:after:content-['']">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </article>
                      ) : (
                        <Thinking />
                      )
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="border-t border-border bg-background/80 p-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <Textarea
              placeholder="Ask anything — math, code, history…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              className="min-h-[52px] max-h-40"
            />
            {streaming ? (
              <Button onClick={cancel} variant="destructive" size="icon">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => send(input)}
                size="icon"
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" />
      <span className="ml-2 text-xs text-muted-foreground">Thinking…</span>
    </div>
  );
}
