"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth";
import { Loader2 } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, initialized, init } = useAuth();

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  useEffect(() => {
    if (initialized && !user) router.replace("/auth/login");
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm">Preparing your study space…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
