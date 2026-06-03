import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Study<span className="gradient-text">Buddy</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              The AI-native learning workspace. Built to help students learn
              faster, revise smarter, and score higher.
            </p>
            <div className="mt-4 flex gap-3 text-muted-foreground">
              <a href="#" className="transition hover:text-foreground">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="transition hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="transition hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#planner">Study Planner</a>
              </li>
              <li>
                <a href="#tutor">AI Tutor</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 StudyBuddy. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
