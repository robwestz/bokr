---

# Heroku deploy (recommended temporary hosting)

This repo can run as **one Heroku app** (web + API in same process) using `server.mjs`.
This keeps cookie-based admin sessions working (same-origin).

## Prereqs
- Commit a `pnpm-lock.yaml` at repo root (Heroku uses it to select pnpm). See Heroku Node.js support docs.

## Steps (CLI)
1) `heroku login`
2) `heroku apps:create <your-app-name>`
3) Add Postgres:
   - `heroku addons:create heroku-postgresql:essential-0` (or any tier you have)
4) Config vars (minimum):
   - `heroku config:set JWT_SECRET=<random> EMAIL_MODE=console EMAIL_FROM=no-reply@yourdomain`
   - Set S3 vars if using real S3 for PDFs (optional for demo):
     `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
5) Deploy:
   - `git push heroku main`
   (Release phase runs `prisma migrate deploy` automatically via Procfile.)

## Bootstrap superadmin (first time)
- `heroku run pnpm --filter @mtb/api bootstrap`

## Logs
- `heroku logs --tail`
