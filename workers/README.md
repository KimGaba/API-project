# Python workers scaffold

Pragmatic worker skeletons for the first ingestion countries:
- `ingest-norway`
- `ingest-uk`

This is intentionally thin: it gives you a shared fetch/normalize pipeline shape, runnable CLIs, Docker support, and country-specific placeholders without pretending the registry-specific parsing is finished.

## Layout

```text
workers/
  Dockerfile
  requirements.txt
  README.md
  docs/
    SOURCE_ADAPTERS.md
  src/company_data_workers/
    shared/
    ingest_norway/
    ingest_uk/
```

## What exists already

- shared config loading from environment variables
- shared HTTP fetch client with timeout/retry defaults
- shared source record / normalized company dataclasses
- shared JSONL writer for raw and normalized output
- worker runner that supports `fetch`, `normalize`, `run`, and Norway `ingest-db`
- country-specific source adapters for Norway and UK with fixture mode by default
- safe live-sample mode for Norway today, and for UK when authenticated sample inputs are supplied
- tiny Norway-to-Postgres MVP upsert path for local validation
- CLI entrypoints via `python -m ...`

## Quick start

```bash
cd workers
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
```

Run Norway worker:

```bash
python -m company_data_workers.ingest_norway.cli run --limit 5
```

Ingest a tiny Norway sample into Postgres:

```bash
python -m company_data_workers.ingest_norway.cli ingest-db --limit 2
```

Run UK worker:

```bash
python -m company_data_workers.ingest_uk.cli run --limit 5
```

Outputs land under `workers/output/<country>/` by default:
- `raw.jsonl`
- `normalized.jsonl`

## Live sample modes

### Norway live sample

Public source, safe for bounded local batches.

Small first-page sample:

```bash
NORWAY_SOURCE_MODE=live \
python -m company_data_workers.ingest_norway.cli run --limit 10
```

Repeatable multi-page batch example:

```bash
NORWAY_SOURCE_MODE=live \
python -m company_data_workers.ingest_norway.cli run \
  --limit 250 \
  --start-page 0 \
  --page-size 100 \
  --max-pages 3
```

Next batch, without reusing page 0:

```bash
NORWAY_SOURCE_MODE=live \
python -m company_data_workers.ingest_norway.cli run \
  --limit 250 \
  --start-page 3 \
  --page-size 100 \
  --max-pages 3
```

Behavior:
- pages through `https://data.brreg.no/enhetsregisteret/api/enheter?page=N&size=S`
- defaults to `page_size=100` and `max_pages=5`
- caps one local MVP live run at `limit<=1000`, `page_size<=100`, `max_pages<=20`
- keeps raw payload close to Brønnøysund API shape
- writes provenance metadata including NLOD attribution plus the run window (`start_page`, `page_size`, `pages_fetched`)
- intended for larger validation batches and local MVP seeding, not full bulk sync

Batch Postgres ingest variant:

```bash
NORWAY_SOURCE_MODE=live \
python -m company_data_workers.ingest_norway.cli ingest-db \
  --limit 200 \
  --start-page 0 \
  --page-size 100 \
  --max-pages 2
```

This upserts the batch into `companies`, `company_identifiers`, `company_addresses`, `company_activities`, and `source_records`.

### UK live sample

Authenticated official API only; requires explicit company numbers. Keep the API key in your shell or local `.env`, not in code.

Fastest safe path once you have a key:

```bash
cd workers
export COMPANIES_HOUSE_API_KEY=your_real_key_here
python -m company_data_workers.ingest_uk.live_sample 6 7 --check-only
python -m company_data_workers.ingest_uk.live_sample 6 7
```

What the helper does:
- validates company numbers before any API call
- normalizes numeric values to 8 digits (`6` -> `00000006`)
- sets `UK_SOURCE_MODE=live` and `UK_COMPANY_NUMBERS=...` for the child worker process
- refuses to run live mode without `COMPANIES_HOUSE_API_KEY`

Equivalent raw worker invocation:

```bash
UK_SOURCE_MODE=live \
COMPANIES_HOUSE_API_KEY=... \
UK_COMPANY_NUMBERS=00000006,00000007 \
python -m company_data_workers.ingest_uk.cli run --limit 2
```

Behavior:
- calls `https://api.company-information.service.gov.uk/company/<company_number>`
- uses official Companies House API auth
- avoids scraping and keeps request volume tiny and explicit
- without the API key + company number list, UK remains fixture-based
- rejects malformed company numbers early with a clear error

## Docker

Build:

```bash
docker build -t company-data-workers ./workers
```

Run Norway:

```bash
docker run --rm \
  -e WORKER_OUTPUT_DIR=/app/output \
  -v $(pwd)/workers/output:/app/output \
  company-data-workers \
  python -m company_data_workers.ingest_norway.cli run --limit 5
```

Run UK:

```bash
docker run --rm \
  -e WORKER_OUTPUT_DIR=/app/output \
  -v $(pwd)/workers/output:/app/output \
  company-data-workers \
  python -m company_data_workers.ingest_uk.cli run --limit 5
```

## Environment variables

- `DATABASE_URL` default for direct local runs: `postgresql://company_data:company_data_dev@localhost:55432/company_data_dev`
- `WORKER_OUTPUT_DIR` default: `/tmp/company-data-workers`
- `WORKER_HTTP_TIMEOUT_SECONDS` default: `30`
- `WORKER_HTTP_RETRIES` default: `2`
- `NORWAY_SOURCE_BASE_URL` default: `https://data.brreg.no/enhetsregisteret/api/enheter`
- `NORWAY_SOURCE_MODE` default: `fixture` (`live` enables bounded real API batches)
- `NORWAY_LIVE_START_PAGE` default: `0`
- `NORWAY_LIVE_PAGE_SIZE` default: `100` (max `100`)
- `NORWAY_LIVE_MAX_PAGES` default: `5` (max `20`)
- `UK_SOURCE_BASE_URL` default: `https://api.company-information.service.gov.uk/company`
- `UK_SOURCE_MODE` default: `fixture` (`live` requires auth + explicit sample IDs)
- `COMPANIES_HOUSE_API_KEY` optional unless running UK live mode; keep it outside source control
- `UK_COMPANY_NUMBERS` comma-separated list of explicit company numbers for UK live mode

## Next sensible steps

1. Replace Norway fixture-first workflow with bulk seed + `oppdateringer` modes once storage/delta logic is ready.
2. Add UK search helpers behind authenticated APIs rather than web scraping.
3. Add source-specific raw snapshot storage with provenance metadata.
4. Generalize the current Norway-only `ingest-db` path once another country is ready.
5. Add tests around field mapping and idempotency.
