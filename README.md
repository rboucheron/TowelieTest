# TowelieTest — Recipe & Test Tracking POC

A test/recipe-book/bug tracking tool for a SI: Groups contain Products and Recipe Books; Recipe Books contain Test Cases and Bugs. Access is governed by a cumulative per-group role (User < QA < Maintainer < Admin) plus a platform Super-Admin.

## Layout

- `backend/` — Bun + Express API (DDD layers: `domain/`, `application/`, `infrastructure/`, `interfaces/`), Prisma + PostgreSQL, JWT auth.
- `frontend/` — Bun workspaces monorepo:
  - `ui/` — shadcn/ui component library.
  - `api/` — typed API client (Zod-validated) consumed by `website`.
  - `website/` — TanStack Start (React) application.
- `infra/docker/` — `docker-compose.yml` to run Postgres + the backend + the website together.

## Running everything with Docker

```bash
cp infra/docker/.env.example infra/docker/.env
# edit infra/docker/.env: set real JWT secrets and a SEED_SUPERADMIN_PASSWORD
docker compose -f infra/docker/docker-compose.yml up --build
```

This starts Postgres, runs the Prisma migration and seeds one Super-Admin account (from `SEED_SUPERADMIN_EMAIL`/`SEED_SUPERADMIN_PASSWORD`), then serves the backend on `:8000` and the website on `:3000`. Log in as the seeded Super-Admin to create the first Group.

## Running locally without Docker

**Backend** (needs a local Postgres — `docker compose -f infra/docker/docker-compose.yml up postgres` is the easiest way to get one):

```bash
cd backend
cp .env.example .env   # edit DATABASE_URL/JWT secrets/seed credentials to match
bun install
bunx prisma migrate deploy
bun run seed
bun run dev             # http://localhost:8000
```

**Frontend** (from the repo root, or `cd frontend`):

```bash
cd frontend
bun install
cd website
cp ../api/.env.example .env   # VITE_API_URL, defaults to http://localhost:8000
bun run dev              # http://localhost:3000
```

## Quality checks

Each package (`backend`, `frontend/api`, `frontend/ui`, `frontend/website`) has its own `lint`, `format` and `test` scripts:

```bash
bun run lint && bun run test   # run inside each package directory
```

## Notes

- Accounts are created by a Group Admin (or the Super-Admin), not via public self-registration — this matches the spec's "Admin invites users" workflow.
- The refresh token lives in an httpOnly cookie; the access token is kept in memory client-side and re-issued transparently. Authenticated pages are rendered client-side only (no server loader ever touches the token), so a stateless SSR process never mixes up two users' sessions.
- "Affected Products" on a Bug reference real `Product` records from the Group rather than free text, so the field stays consistent with the Group's product list.
