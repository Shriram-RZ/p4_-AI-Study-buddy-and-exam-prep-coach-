# AI Study Buddy & Exam Prep Coach

> **Your Personal AI Study Coach. Learn faster. Revise smarter. Score higher.**

A production-ready, AI-native learning workspace built with **Next.js 15**, **FastAPI**, **PostgreSQL**, and **Gemini Flash**. Replaces the dozen apps students juggle with a single, motivating, premium edtech experience.

---

## Features

- **AI Tutor** — streaming Gemini-powered tutor with markdown, code blocks, conversation memory, thinking animations.
- **Smart Study Planner** — generates an adaptive day-by-day plan from your exam date, syllabus and weak topics; exportable to PDF.
- **Notes Summarizer** — drop a PDF or paste text, get crisp revision notes and key points.
- **Quiz Generator** — fresh MCQs with adaptive difficulty, AI explanations, and weak-area tracking.
- **Flashcards + SM-2 spaced repetition** — interval scheduling powered by your review quality.
- **Weak Area Analysis** — automatic detection of struggling concepts after every quiz.
- **Mock Tests + Progress Analytics** — streaks, weekly minutes, mastery, heatmaps.
- **Custom JWT Auth** — signup, login, logout, forgot/reset, HTTP-only cookies, bcrypt hashing.
- **Polished UI** — Framer Motion animations, glassmorphism, gradient mesh background, responsive across mobile → ultrawide.

---

## Tech stack

| Layer       | Tech                                                  |
| ----------- | ----------------------------------------------------- |
| Frontend    | Next.js 15 · TypeScript · Tailwind · ShadCN · Framer Motion · Lucide |
| Backend     | Python 3.12 · FastAPI · SQLAlchemy 2 · Pydantic v2    |
| Database    | PostgreSQL 16                                         |
| AI          | Gemini Flash (`gemini-flash-latest`) via REST         |
| Auth        | Custom JWT + bcrypt + HTTP-only cookies               |
| PDF / files | pypdf · jsPDF · react-pdf                             |
| Deploy      | Vercel (frontend) · Railway / Render / Fly (backend) · Docker |

---

## Project structure

```
.
├── frontend/                      # Next.js 15 app
│   ├── app/
│   │   ├── page.tsx               # Animated landing page
│   │   ├── auth/                  # signup · login · forgot · reset
│   │   └── dashboard/             # planner · tutor · notes · quizzes · flashcards · …
│   ├── components/
│   │   ├── landing/               # Hero, Features, Pricing, FAQ, …
│   │   ├── dashboard/             # Sidebar, Topbar, AuthGate
│   │   ├── auth/                  # AuthShell
│   │   ├── shared/                # AnimatedBackground
│   │   └── ui/                    # ShadCN-style primitives
│   ├── lib/
│   │   ├── api/                   # axios client, auth + study APIs
│   │   ├── store/                 # zustand auth store
│   │   ├── types/                 # shared TS types
│   │   └── utils/                 # cn helper
│   └── tailwind.config.ts
└── backend/                       # FastAPI app
    ├── app/
    │   ├── main.py                # entry point
    │   ├── core/                  # settings, security (jwt + bcrypt)
    │   ├── db/                    # SQLAlchemy session
    │   ├── models/                # users, study, quiz, flashcards, …
    │   ├── schemas/               # Pydantic request/response models
    │   ├── api/
    │   │   ├── deps.py            # CurrentUser dependency
    │   │   └── routes/            # auth · study · tutor (streaming)
    │   └── services/ai/
    │       ├── gemini.py          # Gemini Flash REST client (retry + JSON + SSE)
    │       ├── prompts/           # tutor · planner · quiz · flashcards · summarizer
    │       ├── tutor.py
    │       ├── planner.py
    │       ├── quiz.py
    │       ├── flashcards.py
    │       └── summarizer.py
    ├── migrations/
    │   └── 001_initial.sql        # production-ready PostgreSQL schema
    ├── Dockerfile
    └── requirements.txt
```

---

## Quick start (local)

### 1. Clone & set up environment

```bash
git clone <repo-url>
cd p4_-AI-Study-buddy-and-exam-prep-coach-
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Add your **Gemini API key** to `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
JWT_SECRET=$(openssl rand -hex 32)
```

> Without a key the app still runs in **demo mode** with stubbed AI responses.

### 2. One-command Docker (frontend + backend + Postgres)

```bash
docker compose up --build
```

Or detached + automated smoke tests (Windows PowerShell):

```powershell
.\scripts\docker-up.ps1
```

| Service   | URL                          |
| --------- | ---------------------------- |
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:8000        |
| API docs  | http://localhost:8000/docs   |

Stop everything: `docker compose down`

### 3. Run frontend locally (optional, without Docker)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

---

## Manual setup (without Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Create db + run migration
createdb studybuddy
psql studybuddy -f migrations/001_initial.sql

uvicorn app.main:app --reload

# Frontend (in another shell)
cd frontend
npm install
npm run dev
```

---

## Environment variables

### Backend (`backend/.env`)

| Var                  | Description                                    | Default                        |
| -------------------- | ---------------------------------------------- | ------------------------------ |
| `DATABASE_URL`       | SQLAlchemy URL                                 | `postgresql+psycopg2://…`      |
| `JWT_SECRET`         | **Generate a long random string in prod**      | dev placeholder                |
| `ACCESS_TOKEN_MINUTES` | Session length                              | 10080 (7 days)                 |
| `COOKIE_SECURE`      | Set `true` in production (HTTPS)              | `false`                        |
| `COOKIE_SAMESITE`    | `lax` for same-site, `none` for cross-site    | `lax`                          |
| `CORS_ORIGINS`       | JSON list of allowed origins                  | `["http://localhost:3000"]`    |
| `GEMINI_API_KEY`     | Google AI Studio key                          | (empty → demo mode)            |
| `GEMINI_MODEL`       | Model id                                       | `gemini-flash-latest`          |

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deployment

### Frontend → Vercel

1. Import the `frontend/` directory as a Vercel project.
2. Set `NEXT_PUBLIC_API_URL` to your backend URL.
3. Deploy.

### Backend → Railway / Render / Fly.io

1. Provision a PostgreSQL instance, copy its connection string into `DATABASE_URL`.
2. Deploy the `backend/` folder using the provided `Dockerfile`.
3. Set env vars: `JWT_SECRET`, `GEMINI_API_KEY`, `CORS_ORIGINS=["https://yourapp.vercel.app"]`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`.
4. Run the migration: `psql $DATABASE_URL -f migrations/001_initial.sql`.

> For **cross-domain cookies** (Vercel ↔ Railway) you must set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none`.

---

## API surface

| Method | Path                              | Description                            |
| ------ | --------------------------------- | -------------------------------------- |
| POST   | `/api/auth/signup`                | Create account, sets session cookie    |
| POST   | `/api/auth/login`                 | Sign in                                |
| POST   | `/api/auth/logout`                | Clear cookie                           |
| GET    | `/api/auth/me`                    | Current user                           |
| POST   | `/api/auth/forgot-password`       | Issue reset token                      |
| POST   | `/api/auth/reset-password`        | Consume reset token                    |
| POST   | `/api/study/plans`                | Generate AI study plan                 |
| GET    | `/api/study/plans`                | List user plans                        |
| POST   | `/api/study/summarize`            | Summarize pasted text                  |
| POST   | `/api/study/upload-note`          | Upload PDF/txt → summary               |
| POST   | `/api/study/quiz`                 | Generate quiz                          |
| POST   | `/api/study/quiz/{id}/submit`     | Score + weak areas + explanations      |
| POST   | `/api/study/flashcards`           | Generate flashcards                    |
| POST   | `/api/study/flashcards/{id}/review` | SM-2 review                          |
| GET    | `/api/study/progress`             | Progress + weak areas                  |
| POST   | `/api/tutor/chat`                 | Single-shot AI tutor reply             |
| POST   | `/api/tutor/chat-stream`          | **SSE-streamed** tutor reply           |

---

## AI prompt system

All prompts live in `backend/app/services/ai/prompts/`:

- **`tutor.py`** — system prompt for the streaming tutor (teach-don't-just-answer).
- **`planner.py`** — strict-JSON schema for the day-by-day plan.
- **`quiz.py`** — strict-JSON schema for MCQ/fill/theory generation, with `topic_tag` for weak-area tracking.
- **`flashcards.py`** — strict-JSON for spaced-repetition flashcards.
- **`summarizer.py`** — strict-JSON `{ summary, key_points[] }` output.

The Gemini client (`gemini.py`) handles:

- `generateContent` and `streamGenerateContent` (SSE)
- JSON mode (`responseMimeType: application/json`) with safe fallback parsing
- Exponential-backoff retries on 5xx / 429
- Graceful demo mode when `GEMINI_API_KEY` is unset

---

## Database schema

13 tables, all keyed by user, soft-cascade-deleted on account removal:

`users`, `password_reset_tokens`, `subjects`, `study_plans`, `uploaded_notes`, `ai_summaries`, `quizzes`, `quiz_questions`, `quiz_results`, `flashcards`, `chat_history`, `weak_areas`, `progress_tracking`, `revision_schedule`, `exam_goals`.

See `backend/migrations/001_initial.sql` for the production DDL.

---

## Roadmap

- Voice tutor (Web Speech API)
- OCR for handwritten notes
- YouTube lecture summarizer
- Multilingual learning
- AI mind maps & career roadmaps
- Class dashboards (Campus plan)

---

## License

MIT — feel free to fork, learn, and ship your own edtech startup.
