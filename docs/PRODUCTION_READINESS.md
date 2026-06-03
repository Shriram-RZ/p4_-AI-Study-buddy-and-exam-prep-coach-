# AI Study Buddy Production Readiness

This document captures the current production-grade architecture after the
rebuild pass and the checks needed before deployment.

## Architecture

### Frontend

- Next.js 15 App Router
- React client dashboard with shared dashboard layout
- Zustand for auth/session state
- TanStack React Query for cached data, optimistic updates, polling, and instant
  section revisits
- Recharts for analytics
- KaTeX + markdown/code highlighting in the tutor

Important folders:

- `frontend/app/dashboard/*` - feature pages
- `frontend/components/dashboard/*` - shared dashboard shell, notification center
- `frontend/lib/api/*` - typed API clients
- `frontend/lib/hooks/*` - React Query feature hooks
- `frontend/lib/store/auth.ts` - auth/session store

### Backend

- FastAPI + SQLAlchemy 2
- PostgreSQL persistence
- JWT session cookie auth
- Gemini Flash REST integration with streaming and resilient JSON repair

Important folders:

- `backend/app/api/routes/*` - API contracts
- `backend/app/models/*` - SQLAlchemy models
- `backend/app/schemas/*` - Pydantic request/response schemas
- `backend/app/services/*` - AI and engagement services
- `backend/migrations/*` - SQL migrations

## Database Migrations

Run in order on production:

```bash
psql "$DATABASE_URL" -f backend/migrations/001_initial.sql
psql "$DATABASE_URL" -f backend/migrations/002_notifications_activity.sql
psql "$DATABASE_URL" -f backend/migrations/003_plan_management.sql
psql "$DATABASE_URL" -f backend/migrations/004_flashcard_reviews.sql
psql "$DATABASE_URL" -f backend/migrations/005_user_settings.sql
```

## API Surface

### Auth and Settings

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Planner

- `POST /api/study/plans`
- `GET /api/study/plans`
- `PATCH /api/study/plans/{plan_id}`
- `POST /api/study/plans/{plan_id}/duplicate`
- `DELETE /api/study/plans/{plan_id}`

Planner supports daily, weekly, and monthly granularity; per-block priority,
revision blocks, and archive/restore.

### Tutor

- `POST /api/tutor/chat`
- `POST /api/tutor/chat-stream`
- `GET /api/tutor/history`

### Notes

- `POST /api/study/summarize`
- `POST /api/study/upload-note`

### Quiz and Mock Tests

- `POST /api/study/quiz`
- `POST /api/study/quiz/{quiz_id}/submit`

Mock tests reuse the quiz engine with timed client sessions and persisted quiz
results.

### Flashcards

- `POST /api/study/flashcards`
- `GET /api/study/flashcards?filter=all|due|mastered`
- `GET /api/study/flashcards/stats`
- `POST /api/study/flashcards/{card_id}/review`

Flashcards use SM-2 scheduling and persist review history.

### Engagement, Notifications, Analytics

- `GET /api/notifications`
- `POST /api/notifications/{notif_id}/read`
- `POST /api/notifications/read-all`
- `GET /api/notifications/activity`
- `GET /api/study/weak-areas`
- `GET /api/study/progress`
- `GET /api/study/analytics`

## Local Verification

Backend smoke:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/docs
```

Frontend production build:

```powershell
cd frontend
npm.cmd run build
```

Settings e2e verified locally:

- Signup
- `PATCH /api/auth/profile`
- `POST /api/auth/change-password`
- Login with new password

Flashcards e2e verified locally:

- Generate cards
- List due cards
- Review with SM-2 quality
- Confirm retention/streak stats update

Weak areas e2e verified locally:

- Submit a quiz with wrong answers
- Confirm `/api/study/weak-areas` returns severity and suggested minutes

## Environment

Backend required:

- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_BASE_URL`
- `CORS_ORIGINS`
- cookie settings (`COOKIE_SECURE`, `COOKIE_SAMESITE`, optional domain)

Frontend required:

- `NEXT_PUBLIC_API_URL`

Production notes:

- Use a long random `JWT_SECRET`.
- Set `COOKIE_SECURE=true` behind HTTPS.
- Restrict `CORS_ORIGINS` to deployed frontend domains.
- Do not commit `.env` files.

## Deployment Guide

### Backend

1. Provision PostgreSQL.
2. Run all migrations in order.
3. Deploy FastAPI with a production ASGI server.
4. Configure environment variables.
5. Verify `/health`, `/docs`, auth, and one AI endpoint.

### Frontend

1. Set `NEXT_PUBLIC_API_URL` to the backend origin.
2. Run `npm install --legacy-peer-deps`.
3. Run `npm.cmd run build`.
4. Deploy the `.next` app to Vercel or another Node host.

## Production Checklist

- [x] Pricing/subscription content removed.
- [x] Dashboard pages are routed and compile.
- [x] Notification center persists to PostgreSQL.
- [x] Activity logging powers dashboard and analytics.
- [x] Planner, tutor, quiz, flashcards, weak areas, progress, mock tests, and
  settings all have real workflows.
- [x] FastAPI validation errors are toast-safe and cannot crash React rendering.
- [x] Gemini JSON parsing handles fences, trailing commas, and truncation.
- [x] AI rate limits return 503 with a friendly message.
- [x] Frontend production build passes.
- [ ] Add CI pipeline for backend import/smoke tests and frontend build.
- [ ] Add full Playwright browser tests for auth and dashboard workflows.
- [ ] Add Alembic-managed migration history before production team handoff.
- [ ] Add email provider integration for password reset instead of demo tokens.
- [ ] Add object storage for uploaded notes/PDFs if file retention is required.
- [ ] Add observability: request logs, AI error rates, and queue/latency metrics.

