# CodexPaycheckDashboard

Backend-backed version of the paycheck dashboard for Vercel + Neon.

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
