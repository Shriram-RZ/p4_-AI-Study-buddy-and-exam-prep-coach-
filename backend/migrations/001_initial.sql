-- AI Study Buddy — initial PostgreSQL schema
-- Run on a fresh database. Models are also auto-created via SQLAlchemy in dev,
-- but use this for production-grade migrations.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  education_level VARCHAR(80),
  streak INT NOT NULL DEFAULT 0,
  productivity_score INT NOT NULL DEFAULT 70,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_name VARCHAR(180) NOT NULL,
  exam_date TIMESTAMPTZ NOT NULL,
  daily_hours REAL NOT NULL DEFAULT 2.0,
  syllabus TEXT NOT NULL,
  weak_topics JSONB NOT NULL DEFAULT '[]',
  schedule JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_plans_user ON study_plans(user_id);

CREATE TABLE IF NOT EXISTS uploaded_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES uploaded_notes(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(180) NOT NULL,
  difficulty VARCHAR(16) NOT NULL DEFAULT 'medium',
  quiz_type VARCHAR(16) NOT NULL DEFAULT 'mcq',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type VARCHAR(16) NOT NULL DEFAULT 'mcq',
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  topic_tag VARCHAR(120),
  position INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_qq_quiz ON quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}',
  weak_topics JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(180) NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease REAL NOT NULL DEFAULT 2.5,
  interval_days INT NOT NULL DEFAULT 1,
  repetitions INT NOT NULL DEFAULT 0,
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fc_user_review ON flashcards(user_id, next_review);

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_history(user_id, created_at);

CREATE TABLE IF NOT EXISTS weak_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(180) NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  last_practiced TIMESTAMPTZ NOT NULL DEFAULT now(),
  recommended_action TEXT
);

CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  minutes INT NOT NULL DEFAULT 0,
  quizzes_completed INT NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS revision_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(180) NOT NULL,
  next_revision TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS exam_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_name VARCHAR(180) NOT NULL,
  target_score VARCHAR(60),
  deadline TIMESTAMPTZ NOT NULL,
  notes TEXT
);
