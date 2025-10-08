# Publisher Dashboard (Next.js app)

Visualizes metered usage, earnings, and content performance for publishers pulling data from the content proxy.

## Setup

```bash
pnpm install
cp .env.example .env.local

# ensure the proxy is running + seeded (see ../content-proxy)
pnpm --filter content-proxy dev

# run the dashboard
pnpm dev
```

`NEXT_PUBLIC_CONTENT_PROXY_URL` must match the proxy base URL (defaults to `http://localhost:3002`). The dashboard listens on http://localhost:3000 and fetches analytics from `/api/analytics/overview`.

## Useful Commands

- `pnpm dev` – dashboard with Turbopack
- `pnpm lint` / `pnpm check-types` – quality checks
- `pnpm test` – add when ready; currently not configured
