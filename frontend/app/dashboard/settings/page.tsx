"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/auth";

export default function SettingsPage() {
  const user = useAuth((s) => s.user);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    education_level: user?.education_level ?? "",
  });

  return (
    <>
      <Topbar title="Settings" />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">
                Update how the AI tutor addresses you.
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Education level
                  </label>
                  <Input
                    value={form.education_level ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, education_level: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={() => toast.success("Profile saved")}
                  className="w-full sm:w-auto"
                >
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Preferences</h2>
              <div className="mt-4 space-y-4 text-sm">
                <Toggle
                  title="Daily revision reminder"
                  desc="At 6 PM every day. Powered by streak motivation."
                />
                <Toggle
                  title="AI motivational nudges"
                  desc="Receive a quick AI pep-talk when you hit a slump."
                />
                <Toggle title="Sound effects" desc="Streak chimes & XP pings." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-destructive">
                Danger zone
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Deleting your account permanently removes notes, quizzes,
                flashcards and progress.
              </p>
              <Button variant="destructive" className="mt-3">
                Delete account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function Toggle({ title, desc }: { title: string; desc: string }) {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn(!on)}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-card/40 p-4 text-left"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          on ? "bg-gradient-to-r from-brand-500 to-violet-600" : "bg-secondary"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
