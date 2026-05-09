# European Company Data Platform MVP

Local MVP scaffold for a European company data API product.

## Running services
- Public site / docs / demo: `http://192.168.86.23:3010`
- API: `http://192.168.86.23:3011`
- Customer dashboard: `http://192.168.86.23:3012`
- Internal admin / backend / control surface: `http://192.168.86.23:3014`
- Deprecated legacy internal admin port: `http://192.168.86.23:3013`
- Legacy admin status page (fallback only): `http://192.168.86.23:3010/admin.html`
- Postgres: host port `55432`
- Redis: host port `56379`

## Surface map
- `site/` = public surface for prospects and developers evaluating the product
- `apps/dashboard` = signed-in customer surface for keys, usage, billing and customer-side testing
- `apps/project` = canonical internal operator/admin/backend/control surface at `3014`, currently carrying the internal board and broader control-surface direction
- `apps/admin` = deprecated legacy internal admin app that should no longer be treated as the primary destination
- `site/admin.html` = static fallback admin status page only

Use the public site as the front door, the dashboard for customer workflows, and `3014` as the canonical internal surface for admin/backend/control work. Do not treat `3013` and `3014` as parallel long-term internal destinations.

### Fixed local port mapping
- `3010` = public frontend
- `3011` = API
- `3012` = customer dashboard
- `3014` = canonical internal admin/backend/control surface
- `3013` = deprecated legacy internal admin port

Important: `3014` is now the single canonical internal surface. `3013` is deprecated and should only appear where needed for legacy compatibility or migration notes.

### Internal surface note
- On this machine, `3014` is the intended default internal surface URL.
- Treat `3013` as deprecated in docs, handoffs, and assumptions.
- If you change the internal surface port later, update any consumers that assume the default internal URL, such as handoff environment variables in other local apps.

## Working endpoints
- `GET /health`
- `GET /v1/meta/countries`
- `GET /v1/companies/search?q=Eksempel&country=NO&limit=5`
- `GET /v1/admin/status`

## API local build sanity
From `apps/api`:

```bash
npm run check
npm run build
```

If the build reports `EACCES` writing into `dist/`, run `npm run doctor:permissions` in `apps/api`. That script reports any root-owned `dist/` or `node_modules/` entries and prints the exact `chown` command needed before retrying the build.

## Minimal API refresh path for updated source code

In this project the quickest reliable way to get fresh API code live is:

```bash
cd /home/gaba/.openclaw/workspace/company-data-project
docker compose up -d api
```

That works because the `api` service already runs:
- `npm install`
- `npm run build`
- `npm run start`

The Docker/root build path now skips the non-root permission doctor, so local container rebuilds no longer fail just because bind-mounted `node_modules/` or `dist/` are root-owned.

Quick verification commands:

```bash
curl -sS http://127.0.0.1:3011/health
curl -sS http://127.0.0.1:3011/v1/admin/status | python3 -m json.tool
curl -sS http://127.0.0.1:3011/v1/billing/plans | python3 -m json.tool
curl -sS -H 'x-api-key: demo_live_123' 'http://127.0.0.1:3011/v1/companies/search?country=NO&limit=5' | python3 -m json.tool
```

Use API header:
- `x-api-key: demo_live_123`

## Current MVP state
This MVP is a runnable scaffold with:
- Fastify + TypeScript API
- PostgreSQL schema + seed data
- Redis for future rate limiting / caching
- Norway + UK ingestion worker skeletons
- local project tracker site

## Notes
- Search reads from Postgres and now labels source-backed ingested rows vs older seeded demo rows in the response payload.
- Workers currently output raw/normalized JSONL data, with Norway safe-live support and an explicit UK live-test path.
- Norway now also has a tiny `ingest-db` MVP path that upserts a small sample into Postgres, and those rows show up clearly via the existing `/v1/companies/search` flow.
- UK live testing is designed to keep the Companies House API key in environment variables, not in code.
- Billing groundwork now includes a local Stripe scaffold for env layout, plan mapping, and webhook event storage; see `docs/BILLING_STRIPE_GROUNDWORK.md`.
- See `docs/UK_LIVE_TEST_RUNBOOK.md` for the exact live sample flow.

## Norway Postgres ingest MVP

Small-to-medium explicit local batches, still intentionally bounded:

```bash
cd workers
pip install -r requirements.txt
pip install -e .

# fixture sample -> Postgres
python -m company_data_workers.ingest_norway.cli ingest-db --limit 2

# first live batch -> Postgres
NORWAY_SOURCE_MODE=live \
python -m company_data_workers.ingest_norway.cli ingest-db \
  --limit 200 \
  --start-page 0 \
  --page-size 100 \
  --max-pages 2

# next repeatable batch -> Postgres
NORWAY_SOURCE_MODE=live \
python -m company_data_workers.ingest_norway.cli ingest-db \
  --limit 200 \
  --start-page 2 \
  --page-size 100 \
  --max-pages 2
```

What it writes:
- `companies`
- `company_identifiers` (registration number)
- `company_addresses`
- `company_activities`
- `source_records`
- ensures the Norway `source_registry` row exists

Notes:
- default direct DB target is `postgresql://company_data:company_data_dev@localhost:55432/company_data_dev`
- you can override with `DATABASE_URL`
- live Norway paging is now repeatable via `--start-page`, `--page-size`, and `--max-pages`
- current safety guards: `limit<=1000`, `page_size<=100`, `max_pages<=20`
- VAT now stays `NULL` until a real source-backed VAT value exists; the old placeholder VAT workaround has been removed
- current Norway activity normalization labels `naeringskode1` as `NO_SN2007` rather than a generic placeholder code system
