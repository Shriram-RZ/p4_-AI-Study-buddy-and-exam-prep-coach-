"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/auth";
import { apiError } from "@/lib/api/client";

const LEVELS = [
  "High School",
  "Undergraduate",
  "Graduate",
  "Test Prep (JEE/NEET/SAT/GRE)",
  "Self-learner",
];

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuth((s) => s.signup);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    education_level: LEVELS[0],
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      toast.success("Welcome to StudyBuddy!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(apiError(err, "Could not create your account"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Personalized AI tutoring in under 30 seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-brand-600 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <Input
            required
            placeholder="Aarav Patel"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Education level</label>
          <select
            value={form.education_level}
            onChange={(e) =>
              setForm({ ...form, education_level: e.target.value })
            }
            className="mt-1.5 flex h-11 w-full rounded-xl border border-border bg-card/60 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our Terms & Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
