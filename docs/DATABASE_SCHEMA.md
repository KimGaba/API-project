# PostgreSQL Schema v1

This is the practical first schema for the European company data MVP.

## Goals for v1
- support 2 initial countries cleanly
- keep provenance and licensing visible
- make exact lookups fast
- keep name search good enough without a separate search cluster
- support API keys, quotas, Stripe-backed subscriptions, and usage metering
- stay simple enough to run locally in Docker

## Core design choices
- **PostgreSQL is the source of truth** for companies, provenance, customers, subscriptions, and usage.
- **Redis is operational only**: per-minute rate limits, short-lived cache, and optional queue coordination.
- **Plain SQL migrations first**. They are easy to run from Docker and easy to port to Prisma/Drizzle later.
- **Canonical record + provenance model**: `companies` is the public-facing record; `source_records`, `raw_artifacts`, and `change_log` retain evidence and history.

## Main table groups

### Canonical company data
- `companies`
- `company_identifiers`
- `company_addresses`
- `company_activities`
- `company_officers`
- `source_records`
- `change_log`

### Operations and ingestion
- `source_registry`
- `ingestion_runs`
- `raw_artifacts`

### Customer, auth, billing
- `customers`
- `subscriptions`
- `api_keys`
- `usage_counters`
- `usage_events`
- `webhook_events`

## Why these additions vs the earlier draft

### Added `customers`
Needed to separate people/accounts from subscriptions and keys. It keeps ownership and Stripe mapping clean.

### Added `usage_counters`
Monthly quota checks should not scan raw usage logs on every request. `usage_counters` is the hot-path table; `usage_events` remains the audit trail.

### Added `source_registry`, `ingestion_runs`, and `raw_artifacts`
This makes ingestion observable and keeps licensing/provenance first-class, which matters a lot for this product.

### Added `webhook_events`
Stripe webhook handling should be idempotent from day one.

## Search/index strategy
- exact lookup by company UUID
- unique-ish lookup by `(country_code, registration_number)`
- unique-ish lookup by `(country_code, vat_number)`
- fuzzy name search using `pg_trgm` on `companies.normalized_name`
- identifier lookups through `company_identifiers(identifier_type, identifier_value)`

## Redis usage notes
Use Redis for these only:

1. **Rate limiting**
   - key: `ratelimit:{api_key_id}:{minute_bucket}`
   - TTL: 120 seconds
   - authoritative limit comes from `subscriptions.rpm_limit`

2. **Hot search/result caching**
   - key: `company-search:{sha256(query)}`
   - TTL: 60–300 seconds
   - cache only public API responses, never raw source payloads

3. **Optional job coordination**
   - queue names like `ingest:uk_companies_house`
   - safe for retries and short-lived work dispatch

Do **not** use Redis as the source of truth for subscription state, monthly quota, or provenance.

## Docker/dev stack plan

### Minimum local stack
- `postgres` for system-of-record data
- `redis` for rate limits and cache
- optional `api` profile container as a mount-ready placeholder
- optional `worker` profile container as a mount-ready placeholder
- existing static site stays untouched

### Startup
```bash
cp .env.example .env
docker compose up -d postgres redis
```

### Apply schema
```bash
docker compose exec -T postgres psql -U company_data -d company_data_dev < packages/db/migrations/0001_init.sql
docker compose exec -T postgres psql -U company_data -d company_data_dev < packages/db/migrations/0002_nullable_vat_cleanup.sql
docker compose exec -T postgres psql -U company_data -d company_data_dev < packages/db/seed/0001_seed_reference_data.sql
```

## Norway-driven cleanup notes
- `vat_number` must remain genuinely nullable. Placeholder VAT values create fake identifiers and pollute exact-lookup behavior.
- `company_identifiers` should hold source-backed identifiers like registration numbers even when the same value is duplicated on `companies` for convenience.
- Norway `naeringskode1` is currently mapped as `NO_SN2007`; longer term we may want a small reference table for code systems rather than free-text labels.

## Still-needed schema changes (not required for the MVP-safe cleanup)
1. Add a first-class `identifier_source` / `is_verified` story if we start storing multiple VAT/tax identifiers per company.
2. Consider a `code_systems` reference table once more countries are live, to avoid drift between `SIC2007`, `NO_SN2007`, and later country-specific systems.
3. Decide whether `companies.registration_number` remains a convenience column or whether all exact lookups should eventually resolve through `company_identifiers` first.

## Suggested next implementation steps
1. wire API search endpoints against `companies` + child tables
2. implement API-key hashing and lookup middleware
3. implement Redis RPM limiter
4. implement worker upserts into `companies`/`source_records`
5. add one country connector end-to-end before widening the schema again

## Files added
- `packages/db/migrations/0001_init.sql`
- `packages/db/seed/0001_seed_reference_data.sql`
- `packages/db/README.md`
- `.env.example`
- updated `docker-compose.yml`
