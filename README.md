# Jefferson Trader — Gym & Nutrition Tracker

A full-stack app for tracking gym workouts and nutrition (clean bulk / bulk / cut), backed by a
seeded database of 170+ foods across 12 categories and 70 exercises.

## Features

- **Auth** — email/password accounts, sessions via signed JWT cookies.
- **Workouts** — log sessions, sets (reps/weight/RPE) across 70 seeded exercises; per-exercise
  progress charts (max weight & volume over time).
- **Nutrition** — daily food diary by meal (breakfast/lunch/dinner/snack), searchable food
  database, custom food creation, macro/calorie targets per goal.
- **Goals** — Clean Bulk / Bulk / Cut / Maintain presets that prefill calorie & macro targets.
- **Body weight** — log weight over time with a trend chart.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + SQLite (via the better-sqlite3
driver adapter), Recharts, Zod, bcryptjs + jose for auth.

## Getting started

```bash
npm install
cp .env.example .env   # then set a real AUTH_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

## Expanding the food database

`src/data/foods.json` and `src/data/exercises.json` are the seed sources — re-run
`npx prisma db seed` after editing them (it skips re-seeding foods if non-custom foods already
exist, so wipe `dev.db` first if you want a clean reseed). To go truly massive, import a
USDA FoodData Central CSV export into the same `Food` shape and load it with a custom script.
