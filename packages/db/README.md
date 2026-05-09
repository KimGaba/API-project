# Database package

Pragmatic PostgreSQL v1 schema for the European company data MVP.

## What is here
- `migrations/0001_init.sql` — first schema migration
- `migrations/0002_nullable_vat_cleanup.sql` — removes fake-VAT pressure from the MVP uniqueness rules
- `seed/0001_seed_reference_data.sql` — small reference seed for known sources

## Local usage
Start the local stack:

```bash
docker compose up -d postgres redis
```

Apply the schema:

```bash
docker compose exec -T postgres psql -U company_data -d company_data_dev < packages/db/migrations/0001_init.sql
```

Load reference seed data:

```bash
docker compose exec -T postgres psql -U company_data -d company_data_dev < packages/db/seed/0001_seed_reference_data.sql
```

Load a tiny Norway sample through the worker:

```bash
docker compose exec -T postgres psql -U company_data -d company_data_dev < packages/db/migrations/0002_nullable_vat_cleanup.sql
```


```bash
docker compose run --rm worker-no sh -lc "pip install -r requirements.txt && PYTHONPATH=src python -m company_data_workers.ingest_norway.cli ingest-db --limit 2"
```

## Schema design notes
- PostgreSQL is the source of truth.
- Redis is only for rate limiting, cache, and lightweight queue/co-ordination.
- `companies` stores the canonical record.
- `source_records`, `raw_artifacts`, and `change_log` preserve provenance and auditability.
- `usage_counters` is the hot-path monthly quota table.
- `usage_events` is the append-only billing/audit trail.

## Search strategy for MVP
- Exact lookup by company id
- Exact lookup by `(country_code, registration_number)`
- Exact lookup by VAT when a real VAT identifier exists
- Name search through `normalized_name` + `pg_trgm`

## Norway cleanup notes
- `companies.vat_number` is intentionally nullable; do not synthesize placeholder VAT values just to satisfy uniqueness.
- Norway ingest now persists the registration number into `company_identifiers` so the schema is used the way the API product expects.
- Existing local databases created before this cleanup should also apply `migrations/0002_nullable_vat_cleanup.sql`.

## Suggested app behavior
- API keys are stored hashed, never plaintext.
- Monthly quotas come from `subscriptions.monthly_quota` and `usage_counters`.
- RPM limits live in Redis using keys like `ratelimit:{api_key_id}:{minute_bucket}`.
