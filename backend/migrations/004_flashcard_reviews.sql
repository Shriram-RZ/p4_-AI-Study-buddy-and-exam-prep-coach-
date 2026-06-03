-- AI Study Buddy — migration 004: flashcard review log (SM-2 analytics)

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  quality INT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fcr_user_time
  ON flashcard_reviews(user_id, reviewed_at);
