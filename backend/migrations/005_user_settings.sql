-- User settings and preferences.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS daily_study_hours REAL NOT NULL DEFAULT 3.0,
  ADD COLUMN IF NOT EXISTS exam_target VARCHAR(180),
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT
    '{"quiz": true, "revision": true, "flashcards": true, "tutor": true}'::jsonb;

