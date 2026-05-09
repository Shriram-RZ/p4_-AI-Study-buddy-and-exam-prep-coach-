"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { apiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await authApi.forgotPassword(email);
      setToken(r.reset_token);
      toast.success("Reset link generated");
    } catch (err) {
      toast.error(apiError(err, "Could not generate reset link"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email — we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-brand-600 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {token ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
          <p className="font-medium">Reset link ready</p>
          <p className="mt-1 text-muted-foreground">
            For demo purposes, click the link below to reset your password:
          </p>
          <Link
            href={`/auth/reset-password?token=${token}`}
            className="mt-3 inline-block break-all text-brand-600 hover:underline"
          >
            /auth/reset-password?token={token.slice(0, 24)}…
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
