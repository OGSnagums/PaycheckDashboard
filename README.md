# CodexPaycheckDashboard

Backend-backed version of the paycheck dashboard for Vercel + Neon.

## Live app

[Paycheck Dashboard](https://paycheck-dashboard-three.vercel.app)

Verified October 20, 2026: existing signed-in session loads the dashboard and CC
planner; anonymous dashboard/audit API requests return 401. The saved payment
date is historical and needs owner review. No financial data was edited.

## Project checks

Use Node.js 22.13+ (Node 24 recommended).

```bash
npm ci
npm run check
```

`check` runs standalone ESLint (zero warnings), Node regression tests, the
production build, and an npm dependency audit. `npm run lint`, `npm test`, and
`npm run build` are also available separately.

The tests cover legacy-state migration, preservation of saved balances, isolated
defaults, audit diffs, and the biweekly payday cadence.

Next.js stays on the patched 15.5 line. PostCSS, sharp, and source-map-js are
explicitly overridden to patched versions because upstream constraints otherwise
retain vulnerable transitive dependencies. Recheck these overrides on framework
updates. Standalone ESLint intentionally avoids the Next preset's currently
unpatched fast-glob/braces dependency chain; Next's build may warn that its lint
plugin is absent. Framework-specific lint rules are not included.

Local validation does not deploy changes. On October 20, 2026, the Vercel CLI login
was refreshed through the existing Safari session and the validated working tree
was deployed to production:
[deployment record](https://vercel.com/ogsnagums-projects/paycheck-dashboard/2KToe2y4oLEvAnvbZJyP8MDvWRfx).
Vercel reported `READY`; the production alias serves the patched JavaScript
bundles, the signed-in dashboard loads saved data, and anonymous dashboard/audit
requests return 401. No budget edits or database-secret changes were performed.
This was a direct CLI deployment. Keep the deployed app source and dependency
lockfile in GitHub so future Git-based deployments retain the fixes.
`.vercelignore` excludes local secrets and caches from uploads.

## Stack
- Next.js App Router
- Postgres via `pg`
- Single-user password auth with signed HTTP-only cookie sessions
- Dashboard state stored as `jsonb`
- Lightweight audit trail

## Environment
Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=postgres://...
DATABASE_SSL=true
SESSION_SECRET=long-random-secret
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=strong-password
```

## Local run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed admin manually
If you want to seed the admin user before first app login:

```bash
npm run seed:admin
```

## Core API
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/dashboard`
- `PUT /api/dashboard`
- `POST /api/dashboard/reset`
- `GET /api/dashboard/audit`
