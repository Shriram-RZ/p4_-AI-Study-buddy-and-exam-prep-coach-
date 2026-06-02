-- AI Study Buddy — migration 003: study plan management
-- Adds granularity (daily/weekly/monthly) and archive support. Idempotent.

ALTER TABLE study_plans
  ADD COLUMN IF NOT EXISTS granularity VARCHAR(16) NOT NULL DEFAULT 'daily';

ALTER TABLE study_plans
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_plans_user_archived
  ON study_plans(user_id, archived, created_at);
