# Maldives Table Booking — Core (Scaffold)

This repo is the EXECUTION start (P0 foundation) derived from planning docs in `docs/source_workspace/**`.

## Stack (initial, changeable via Change Request)
- Web: Next.js (apps/web)
- API: Express + TypeScript (services/api)
- DB: PostgreSQL + Prisma
- Local infra: Docker Compose (Postgres + MinIO)

## Quick start
1) Install Node 18+ and pnpm.
2) Env:
   - `cp services/api/.env.example services/api/.env`
   - `cp apps/web/.env.example apps/web/.env.local`
3) Infra:
   - `docker compose -f infra/docker-compose.yml up -d`
4) Install:
   - `pnpm install`
5) DB:
   - `pnpm db:migrate`
   - `pnpm db:seed`
6) Dev:
   - `pnpm dev`

Seeded SUPERADMIN:
- email: admin@example.com
- password: Admin123!


## PDF upload (P1)
- Admin can generate a presigned PUT URL (MinIO local) and upload a PDF.
- Public menu endpoint returns a signed GET URL if the PDF is marked CLEAN.


## Heroku
This repo includes a root `server.mjs` + `Procfile` to run Web+API in one Heroku app (recommended for cookie-based admin sessions).
See `docs/RUNBOOK.md`.
