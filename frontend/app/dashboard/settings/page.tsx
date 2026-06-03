"use client";

import { useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Bell,
  BookOpen,
  KeyRound,
  LogOut,
  Save,
  Shield,
  UserRound,
} from "lucide-react";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/auth";
import { apiError } from "@/lib/api/client";

const DEFAULT_PREFS = {
  quiz: true,
  revision: true,
  flashcards: true,
  tutor: true,
};

type SettingsForm = {
  name: string;
  email: string;
  education_level: string;
  avatar_url: string;
  daily_study_hours: number;
  exam_target: string;
  notification_preferences: typeof DEFAULT_PREFS;
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    education_level: "",
    avatar_url: "",
    daily_study_hours: 3,
    exam_target: "",
    notification_preferences: DEFAULT_PREFS,
  });
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      education_level: user.education_level ?? "",
      avatar_url: user.avatar_url ?? "",
      daily_study_hours: user.daily_study_hours ?? 3,
      exam_target: user.exam_target ?? "",
      notification_preferences: {
        ...DEFAULT_PREFS,
        ...(user.notification_preferences ?? {}),
      },
    });
  }, [user]);

  const saveProfile = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (
      !Number.isFinite(form.daily_study_hours) ||
      form.daily_study_hours < 0.5 ||
      form.daily_study_hours > 14
    ) {
      return toast.error("Daily study hours must be between 0.5 and 14");
    }
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        education_level: form.education_level.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        daily_study_hours: Number(form.daily_study_hours),
        exam_target: form.exam_target.trim() || null,
        notification_preferences: form.notification_preferences,
      });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(apiError(err, "Could not save settings"));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (password.next.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }
    if (password.next !== password.confirm) {
      return toast.error("New passwords do not match");
    }
    setSecuritySaving(true);
    try {
      await changePassword(password.current, password.next);
      setPassword({ current: "", next: "", confirm: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(apiError(err, "Could not change password"));
    } finally {
      setSecuritySaving(false);
    }
  };

  const signOut = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const initials =
    form.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SB";

  return (
    <>
      <Topbar title="Settings" />
      <main className="flex-1 p-6">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Profile</h2>
                    <p className="text-sm text-muted-foreground">
                      Keep your study identity and AI context current.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-[96px_1fr]">
                  <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-500/10 to-violet-500/10 text-xl font-bold text-brand-600">
                    {form.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name">
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Email">
                      <Input type="email" value={form.email} disabled />
                    </Field>
                    <Field label="Education level">
                      <Input
                        placeholder="Undergraduate, Grade 12, GATE aspirant..."
                        value={form.education_level}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            education_level: e.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Avatar URL">
                      <Input
                        placeholder="https://..."
                        value={form.avatar_url}
                        onChange={(e) =>
                          setForm({ ...form, avatar_url: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      Study preferences
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      These settings shape future planner and dashboard
                      defaults.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Field label="Daily study hours">
                    <Input
                      type="number"
                      min={0.5}
                      max={14}
                      step={0.5}
                      value={form.daily_study_hours}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          daily_study_hours: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Exam target">
                    <Input
                      placeholder="NEET 2026, GATE CS, Finals..."
                      value={form.exam_target}
                      onChange={(e) =>
                        setForm({ ...form, exam_target: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <p className="text-sm text-muted-foreground">
                      Control which events appear in the notification center.
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <Toggle
                    title="Quiz alerts"
                    desc="Generated quizzes, completed quizzes and score summaries."
                    checked={form.notification_preferences.quiz}
                    onChange={(value) =>
                      setPref("quiz", value, form, setForm)
                    }
                  />
                  <Toggle
                    title="Revision reminders"
                    desc="Upcoming daily goals and revision sessions."
                    checked={form.notification_preferences.revision}
                    onChange={(value) =>
                      setPref("revision", value, form, setForm)
                    }
                  />
                  <Toggle
                    title="Flashcard reviews"
                    desc="Due cards, mastered cards and review streaks."
                    checked={form.notification_preferences.flashcards}
                    onChange={(value) =>
                      setPref("flashcards", value, form, setForm)
                    }
                  />
                  <Toggle
                    title="Tutor milestones"
                    desc="Long-session milestones and learning prompts."
                    checked={form.notification_preferences.tutor}
                    onChange={(value) =>
                      setPref("tutor", value, form, setForm)
                    }
                  />
                </div>
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="mt-5"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save settings"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Security</h2>
                    <p className="text-sm text-muted-foreground">
                      Change your password without leaving the dashboard.
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <Field label="Current password">
                    <Input
                      type="password"
                      value={password.current}
                      onChange={(e) =>
                        setPassword({ ...password, current: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="New password">
                    <Input
                      type="password"
                      value={password.next}
                      onChange={(e) =>
                        setPassword({ ...password, next: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Confirm new password">
                    <Input
                      type="password"
                      value={password.confirm}
                      onChange={(e) =>
                        setPassword({ ...password, confirm: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Button
                  variant="outline"
                  className="mt-5 w-full"
                  onClick={savePassword}
                  disabled={securitySaving}
                >
                  <KeyRound className="h-4 w-4" />
                  {securitySaving ? "Updating..." : "Change password"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">Session</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign out of this browser. Your saved study data stays in your
                  account.
                </p>
                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Toggle({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card/40 p-4 text-left"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-gradient-to-r from-brand-500 to-violet-600"
            : "bg-secondary"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function setPref(
  key: keyof typeof DEFAULT_PREFS,
  value: boolean,
  form: Pick<SettingsForm, "notification_preferences">,
  setForm: Dispatch<SetStateAction<SettingsForm>>
) {
  setForm((current) => ({
    ...current,
    notification_preferences: {
      ...current.notification_preferences,
      [key]: value,
    },
  }));
}
