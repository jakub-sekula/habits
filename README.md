# Habits

> **Archived — October 2026.** This project is no longer hosted or maintained.
> The live instance at `habits.jakubsekula.com` has been shut down and the
> repository is read-only. The code is kept for reference.

Full-stack TypeScript habit tracking app. Includes user authentication,
variable habit frequencies, streaks, scores and a few personalisation options.

## Stack

- **Frontend** (`frontend/`) — Next.js, React, Tailwind CSS, Radix UI, Chart.js
- **Backend** (`backend/`) — Express, Prisma with SQLite, Joi validation
- **Auth** — Firebase Authentication (Google / GitHub sign-in); the backend
  verifies Firebase ID tokens with the Firebase Admin SDK
- **Hosting (former)** — Docker Compose on a single VPS behind nginx, deployed
  from `main` by a GitHub Actions workflow (removed when the project was archived)

## Running it locally

You need your own Firebase project, since the original one is not part of this
repository.

Backend:

```bash
cd backend
npm install
npm run database   # prisma generate + migrate deploy
npm run dev
```

It expects a `backend/.env` with `DATABASE_URL` (e.g. `file:./dev.db`), plus a
Firebase Admin service account JSON next to it (see
`backend/src/firebase-config.ts` for the filename it imports).

Frontend:

```bash
cd frontend
npm install
npm run dev
```

It expects a `frontend/.env` with the `NEXT_PUBLIC_FIREBASE_*` web app config
and `NEXT_PUBLIC_API_URL` pointing at the backend.
