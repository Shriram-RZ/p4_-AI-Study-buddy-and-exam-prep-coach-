"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  FileText,
  Loader2,
  Upload,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { studyApi } from "@/lib/api/study";
import { apiError } from "@/lib/api/client";

export default function NotesPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    key_points: string[];
  } | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const r = await studyApi.uploadNote(file);
      setResult(r);
      toast.success("Notes summarized");
    } catch (err) {
      toast.error(apiError(err, "Could not process file"));
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  const summarizeText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await studyApi.summarize(text);
      setResult(r);
      toast.success("Notes summarized");
    } catch (err) {
      toast.error(apiError(err, "Could not summarize"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Notes Summarizer" />
      <main className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Upload className="h-4 w-4 text-brand-500" /> Upload PDF or
                  text
                </h2>
                <div
                  {...getRootProps()}
                  className={`grid cursor-pointer place-items-center rounded-xl border-2 border-dashed p-10 text-center transition ${
                    isDragActive
                      ? "border-brand-500 bg-brand-500/5"
                      : "border-border hover:border-brand-500/40 hover:bg-accent/40"
                  }`}
                >
                  <input {...getInputProps()} />
                  <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drop a PDF, .txt or .md here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Up to 10 MB · or click to browse
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-violet-500" /> Or paste
                  notes
                </h2>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your notes, lecture transcript, or chapter text…"
                  className="min-h-[200px]"
                />
                <Button
                  onClick={summarizeText}
                  className="mt-3 w-full"
                  disabled={loading || !text.trim()}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Summarize with AI
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            {loading && !result && (
              <Card>
                <CardContent className="grid min-h-[400px] place-items-center p-6">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Analyzing concepts and generating revision notes…
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Summary
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {result.summary}
                    </p>

                    <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Key points
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {result.key_points.map((k, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{k}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!loading && !result && (
              <Card>
                <CardContent className="grid min-h-[400px] place-items-center p-12 text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10">
                      <FileText className="h-6 w-6 text-brand-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      Drop your notes
                    </h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                      The AI will extract key concepts, simplify difficult
                      topics, and create revision-ready bullets.
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
