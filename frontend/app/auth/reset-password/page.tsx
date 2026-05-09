"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { apiError } from "@/lib/api/client";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords don't match");
    if (password.length < 8)
      return toast.error("Password must be at least 8 characters");
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success("Password reset. Please sign in.");
      router.push("/auth/login");
    } catch (err) {
      toast.error(apiError(err, "Could not reset password"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Missing reset token.{" "}
        <Link href="/auth/forgot-password" className="text-brand-600">
          Request a new link
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">New password</label>
        <Input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Confirm password</label>
        <Input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose something strong — at least 8 characters."
    >
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
