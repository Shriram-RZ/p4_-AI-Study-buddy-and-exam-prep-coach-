"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-violet-600 to-purple-700" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">StudyBuddy</span>
          </Link>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-balance text-4xl font-bold leading-tight"
            >
              "I went from struggling with calculus to scoring 96% — in 8
              weeks. The AI tutor is unreal."
            </motion.h2>
            <p className="mt-4 text-sm opacity-80">
              — Aarav P., 12th grade · JEE 2026
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <Stat label="Active students" value="120k+" />
            <Stat label="Avg. score lift" value="+18%" />
            <Stat label="Study sessions" value="4.2M" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 lg:hidden"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Study<span className="gradient-text">Buddy</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs opacity-80">{label}</p>
    </div>
  );
}
