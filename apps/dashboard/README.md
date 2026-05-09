# Dashboard user area

Local-first signed-in frontend shell for the Company Data service.

## Purpose

This app is the **customer dashboard** in the three-surface model:
- overview
- API keys
- usage
- billing
- docs
- search / playground
- account settings

Public marketing/docs belong in `site/`.
Internal operator tooling now belongs in the canonical `3014` internal surface direction. Treat `apps/admin` / `3013` as deprecated legacy only.

## Run

```bash
cd apps/dashboard
npm install
npm run dev
```

Default local dev URL: `http://localhost:3012`

## Build / local serving

```bash
npm run build
npm run preview
```

The production build is written to `dist-local/` so the app stays buildable even if an older root-owned `dist/` folder exists from previous runs.

## API base URL

By default the dashboard calls:
- `http://localhost:3011`

You can override that with:

```bash
VITE_API_BASE_URL=http://192.168.86.23:3011 npm run dev
```

Optional docs handoff override:

```bash
VITE_DOCS_BASE_URL=http://localhost:3010 npm run dev
```

Optional internal-surface handoff override:

```bash
VITE_ADMIN_BASE_URL=http://192.168.86.23:3014 npm run dev
```

## Notes

- Uses Vite + React + TypeScript.
- Light nordic styling is the default.
- Dark mode is optional and persisted in local storage.
- The nav now behaves like actual product sections instead of one long placeholder page.
- Search calls `/v1/companies/search` with the seeded demo key `demo_live_123`.
- Billing/admin metadata is loaded when available and degrades cleanly if those API routes are not running yet.
