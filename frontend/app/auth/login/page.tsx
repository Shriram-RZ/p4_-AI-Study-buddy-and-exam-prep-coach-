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

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(apiError(err, "Could not sign in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your learning streak."
      footer={
        <>
          New here?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-brand-600 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot?
            </Link>
          </div>
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
