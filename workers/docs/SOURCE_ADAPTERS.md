# Source adapter notes

This scaffold separates each country worker into three layers:

1. **fetch** — talk to the upstream source, keep raw payloads close to source shape
2. **normalize** — map raw source fields into the shared company schema
3. **sink** — today JSONL files, later Postgres/S3/queue

## Norway adapter plan

Preferred source order:
1. full seed from Brønnøysund bulk download
2. delta sync from `oppdateringer`
3. optional role sync as separate ingestion stream

Current state:
- `source.py` now supports a **safe live paged mode** via `NORWAY_SOURCE_MODE=live`
- live mode hits the public Enhetsregisteret endpoint with explicit paging controls
- current local-MVP controls: `start_page`, `page_size`, `max_pages`, and `limit`
- raw metadata carries source URL, request page/size, run-window details, NLOD attribution, and `safe_sample_only=true`
- default remains fixture mode so local dev stays deterministic

Recommended adapter split:
- `source.py`
  - current: `fetch_live_records()` for public API page samples
  - later: `download_full_snapshot()` and `fetch_updates()`
- `normalize.py`
  - map `organisasjonsnummer`, `navn`, `organisasjonsform`, `naeringskode1`, status flags, address blocks
- future `roles.py`
  - normalize officers / roles into `company_officers`

Notes:
- keep NLOD attribution at source-record level
- preserve municipality/country details from addresses
- do not mix protected identifier paths into the default commercial pipeline
- current live mode is for bounded validation / seed batches, not full bulk crawling
- the repeatable paging window is a pragmatic bridge until proper bulk snapshot + `oppdateringer` sync exists

## UK adapter plan

Preferred source order:
1. profile/search crawl for initial development
2. full seed strategy decided later
3. streaming API or equivalent change-follow for updates

Current state:
- `source.py` now supports a **safe live sample mode** via `UK_SOURCE_MODE=live`
- live mode only runs when both `COMPANIES_HOUSE_API_KEY` and explicit `UK_COMPANY_NUMBERS` are provided
- this avoids unauthenticated scraping and keeps request volume small and intentional
- default remains fixture mode

Recommended adapter split:
- `source.py`
  - current: `fetch_live_records()` for explicit company-profile fetches
  - later `search_companies()` / crawl helpers
- `normalize.py`
  - map `company_number`, `company_name`, `company_status`, dates, SIC codes, registered office
- future `officers.py`
  - separate ingestion flow for officers / PSC / filings

Notes:
- keep raw provenance by endpoint and timestamp
- carry OGL attribution in source metadata
- review personal-data-heavy endpoints before exposing downstream
- Companies House live mode is authenticated by design; without credentials the worker stays fixture-based

## Scaling this beyond Norway

The next-step operating framework for adding Denmark/Finland/France/etc. lives in:
- `docs/COUNTRY_ONBOARDING_FRAMEWORK.md`

Use that doc as the default contract for:
- source adapter boundaries
- shared normalization expectations
- source registry metadata
- ingest run patterns
- country onboarding checklist

## Shared schema assumptions in this scaffold

Current normalized object covers only the safe MVP core:
- country code
- source name
- source record id
- registration number
- company name
- status
- legal form
- incorporation date
- postal address
- industry codes
- raw fetched timestamp

That is enough to start building deterministic mappers before the real DB writer exists.
