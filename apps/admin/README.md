# Admin app

Deprecated legacy internal admin app for Company Data.

## What it covers

- Users
- Billing
- API Usage
- Sources
- Ingestion Runs
- Database
- System Status

## Local run

```bash
cd apps/admin
npm install
npm run dev
```

Legacy local dev URL: `http://192.168.86.23:3013`

> Deprecated: use `http://192.168.86.23:3014` as the canonical internal admin/backend/control surface going forward. Keep `3013` only for legacy compatibility while migration is in progress.

Port resolution order:
- `VITE_ADMIN_PORT`
- `ADMIN_PORT`
- fallback `3013` (deprecated)

If `3013` is already taken on your machine:

```bash
VITE_ADMIN_PORT=3113 npm run dev
```

## Build / local serving

```bash
npm run build
npm run preview
```

The production build is written to `dist-local/` so the app stays buildable even if an older root-owned `dist/` folder exists from previous runs.

## Docker Compose / project stack

From the project root:

```bash
docker compose up admin
```

Or bring up the whole local stack, including dashboard and API:

```bash
docker compose up dashboard admin api postgres redis
```

Legacy compose URL: `http://192.168.86.23:3013`

Canonical internal surface URL: `http://192.168.86.23:3014`

To move the admin surface for this stack, set `ADMIN_PORT` in the project root `.env` before running Compose:

```bash
ADMIN_PORT=3113 docker compose up admin
```

## API wiring

The app will try to read live local data from:

- `GET /health`
- `GET /v1/admin/status`
- `GET /v1/admin/overview`
- `GET /v1/billing/plans`
- `GET /v1/companies/search?limit=6` using the configured admin API key for a protected local catalog sample

Default API base:

- `http://localhost:3011`

Default local admin API key used for protected catalog sampling:

- `demo_live_123`

Override if needed:

```bash
VITE_API_BASE_URL=http://192.168.86.23:3011 \
VITE_ADMIN_API_KEY=demo_live_123 npm run dev
```

Optional surface-handoff overrides:

```bash
VITE_PUBLIC_SITE_URL=http://localhost:3010 \
VITE_DASHBOARD_URL=http://localhost:3012 npm run dev
```

## Notes

- If the API is unavailable, the admin still renders with embedded fallback data.
- Light nordic theme is the default; dark mode is optional via a local toggle.
- This surface is intentionally separate from the public site and the customer dashboard.
