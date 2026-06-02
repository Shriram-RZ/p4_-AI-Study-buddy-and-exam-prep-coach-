-- AI Study Buddy — migration 002: notification center + activity logging
-- Idempotent; safe to re-run. In dev these are also auto-created via SQLAlchemy.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User-facing notifications surfaced in the notification center.
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(48) NOT NULL,
  category VARCHAR(24) NOT NULL DEFAULT 'system',
  title VARCHAR(180) NOT NULL,
  body TEXT,
  link VARCHAR(255),
  read BOOLEAN NOT NULL DEFAULT false,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, read, created_at);

-- Append-only stream of meaningful user actions (powers the activity feed
-- and analytics). Many actions also create a notification.
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(48) NOT NULL,
  entity_type VARCHAR(40),
  entity_id UUID,
  summary VARCHAR(255) NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_user_created
  ON activity_logs(user_id, created_at);
