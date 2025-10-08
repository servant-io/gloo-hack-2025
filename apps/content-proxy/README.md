# Content Proxy (Next.js API)

OAuth-ready gateway that meters content requests, records personalization events, and serves analytics to the publisher dashboard.

## Setup

```bash
pnpm install
cp .env.example .env.local

# launch local Postgres (Docker)
pnpm db:local:up

# apply schema + seed publishers, content, profiles, and analytics events
pnpm db:migrate
pnpm db:seed
```

Key environment variables (`.env.local`):

```
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/content-proxy_dev
CONTENT_PROXY_ALLOWED_ORIGINS=http://localhost:3000
CONTENT_PROXY_RATE_PER_BYTE=0.000002
```

## Daily Commands

- `pnpm dev` – run the API on http://localhost:3002
- `pnpm db:reset && pnpm db:seed` – wipe & reload demo data
- `pnpm db:local:down` – stop Dockerized Postgres

Analytics endpoints live under `/api/analytics/*`; `/api/analytics/overview` returns earnings/request totals for a publisher ID.
