# Country Onboarding Framework

This project now has enough Norway reality that the next risk is **chaotic country growth**: every new country can easily become a slightly different fetch script, a slightly different normalizer, and a slightly different ingest path.

This document defines the next-step framework for adding countries cleanly after Norway.

## Goal

For each new country, we want one predictable shape:

1. register the source
2. implement a country adapter behind shared boundaries
3. emit the same normalized contract
4. run through the same ingest run lifecycle
5. plug into DB/API without special-case chaos

The rule: **country-specific logic belongs at the adapter edge; shared ingestion behavior belongs in shared infrastructure**.

---

## 1. Adapter boundaries

A country adapter should be responsible for only four things:

1. **Source fetch**
   - talk to upstream API, dump, or file source
   - keep raw payload close to source shape
   - attach provenance metadata
2. **Normalization**
   - map source fields into the shared normalized contract
   - do not write directly to API-shaped DTOs
3. **Run planning**
   - define which run modes the source supports
   - seed, delta, sample, backfill, replay
4. **Source-specific enrichment only when necessary**
   - officers, filings, VAT crosswalks, etc. as separate streams

A country adapter should **not** own:
- database schema design
- source registry table semantics
- generic run bookkeeping
- global status mapping rules outside its own source mapping input
- API query behavior

### Recommended per-country package shape

```text
workers/src/company_data_workers/ingest_<country>/
  cli.py
  source.py          # source transport + fetch modes
  normalize.py       # raw -> normalized company contract
  registry.py        # source registry definition for this source
  ingest.py          # shared-run orchestration hookup, not custom SQL soup
  fixtures.py        # optional stable fixture payloads for tests/dev
  validation.py      # optional source-specific input validation
```

Optional later streams:

```text
  officers.py
  filings.py
  changes.py
```

### Boundary rule of thumb

- `source.py` may know endpoint URLs, paging, auth, and retry constraints.
- `normalize.py` may know field mapping and source-specific status/form translations.
- `ingest.py` should mostly compose shared helpers.
- `shared/` should absorb anything that more than one country needs.

If a second country needs the same behavior, stop copying and move it into `shared/`.

---

## 2. Shared normalization contract

Today `NormalizedCompany` is the de facto shared contract. Keep that idea, but make the contract explicit and stable.

## Required normalized company fields

Every country adapter should emit:

- `country_code`
- `source_name`
- `source_record_id`
- `registration_number`
- `company_name`
- `status`
- `legal_form`
- `incorporation_date`
- `address`
- `industry_codes`
- `raw_fetched_at`

That is the **minimum ingestable company envelope**.

## Contract expectations

### `source_record_id`
- must be unique within a source
- should be the upstream registry's own stable record key when possible
- should not be an internal synthetic row counter unless there is no better option

### `registration_number`
- use the country's official company identifier when available
- keep source formatting if legally/operationally important
- do not silently coerce away meaningful leading zeroes

### `company_name`
- carry the upstream canonical company name as-is
- downstream normalized search name is a separate concern

### `status`
- adapter may emit rawish source values at first
- ingest layer should map into platform enum (`active`, `inactive`, `dissolved`, `liquidation`, `bankruptcy`, `unknown`)
- mapping logic should become shared/configurable once the second or third country is onboarded

### `legal_form`
- preserve source-native short form when possible (`AS`, `Ltd`, etc.)
- add human description later in side metadata if needed

### `address`
Expected shape:

```json
{
  "line1": "...",
  "line2": null,
  "postal_code": "...",
  "city": "...",
  "region": null,
  "country_code": "NO",
  "raw_text": null
}
```

Not every source will supply every field. Nulls are fine; silent shape drift is not.

### `industry_codes`
Expected shape:

```json
[
  {
    "code_system": "NACE|SIC2007|...",
    "code": "...",
    "description": "...",
    "is_primary": true
  }
]
```

If `is_primary` is absent in source data, the adapter may set the first item as primary.

## Strong recommendation: add validation around this contract

Before many more countries are added, introduce a shared validator that checks:
- required top-level fields present
- address is always a dict
- industry codes is always a list
- country code matches adapter country
- no adapter emits structurally incompatible JSON

This does **not** need a big framework. A small shared validation function is enough.

---

## 3. Source registry expectations

`source_registry` should be the control plane for country onboarding, not just a metadata parking lot.

Each source row should answer four questions:

1. what is this source?
2. can we legally/commercially use it?
3. how do we run it?
4. what coverage should downstream systems expect?

## Minimum source registry fields per country

For every onboarded source, define:

- `source_code` — stable platform code, e.g. `no_brreg`, `gb_companies_house`
- `source_name`
- `country_code`
- `legal_owner`
- `access_method` — `api`, `bulk`, `file`, `stream`, etc.
- `base_url`
- `license_tag`
- `commercial_reuse_allowed`
- `attribution_required`
- `update_cadence`
- `coverage_notes`
- `metadata`

## What should go in `metadata`

Use `metadata` for operational facts the code can depend on later, for example:

```json
{
  "run_modes": ["fixture", "sample_api", "full_seed", "delta"],
  "supports_bulk": true,
  "supports_delta": true,
  "supports_officers": false,
  "default_status": "active",
  "attribution_text": "Brønnøysundregistrene / Enhetsregisteret",
  "personal_data_review": "required-before-officers"
}
```

That gives admin tooling and future orchestration something structured to read.

## Source registration rule

Each country adapter should expose one explicit source definition, rather than burying literals across random files.

Recommended pattern:
- country-local `registry.py` defines source constants/metadata
- shared DB helper persists/upserts that definition

This is cleaner than today's Norway-only `ensure_norway_source()` pattern.

---

## 4. Ingest run patterns

The project already has `ingestion_runs`. Use it as the standard execution spine.

Every country run should fit one of these modes:

## A. Fixture run
Use for:
- local deterministic development
- smoke tests
- contract validation

Properties:
- no upstream dependency
- stable expected output
- never treated as production freshness

## B. Sample live run
Use for:
- validating auth/connectivity
- proving field mapping against real data
- safe small-volume checks

Properties:
- intentionally tiny
- explicit limits
- provenance marked `safe_sample_only=true`
- not a substitute for real seed/delta coverage

## C. Full seed run
Use for:
- initial population of a country
- large backfills

Properties:
- chunked or paginated
- resumable via checkpoint
- raw artifacts stored separately
- should be idempotent on rerun

## D. Delta/update run
Use for:
- keeping data fresh after seed

Properties:
- checkpoint-based
- repeatable
- small enough for scheduled operation
- failure should not corrupt prior state

## E. Replay/backfill run
Use for:
- reparsing raw artifacts after normalization changes
- targeted repair after bugfixes

Properties:
- does not require re-fetching upstream data
- useful when source terms or volume make refetch expensive

## Standard ingest lifecycle

For all countries, shared orchestration should follow this lifecycle:

1. ensure source registry row exists
2. create `ingestion_runs` row with `queued`/`running`
3. fetch raw records or reference raw artifact
4. persist raw artifact metadata if relevant
5. normalize into shared contract
6. validate normalized contract
7. upsert into relational tables
8. update counters (`seen`, `written`, `failed`)
9. mark run `succeeded`, `partial`, or `failed`

That lifecycle should become the common default. Country code should only customize steps 3 and 5, with minor input specifics for 7.

## Checkpoint expectations

The `checkpoint` field should mean “where can we resume this exact source?”

Examples:
- last page/token
- last change sequence number
- last processed date
- last raw artifact URI + offset

Do not overload checkpoint with vague human notes.

---

## 5. Shared DB ingest expectations

The current Norway DB path proves value, but it is too country-specific to scale cleanly.

## Next shared ingest split

Move toward this shared pattern:

1. `shared/registry.py`
   - generic source upsert helper
2. `shared/ingest.py`
   - create/update `ingestion_runs`
   - apply standard lifecycle
3. `shared/upsert.py`
   - write `companies`, `company_addresses`, `company_activities`, `source_records`
4. country-specific mapping helpers only where needed
   - VAT placeholder quirks
   - country-specific status/form translation inputs

## Design rule

The shared upsert layer should accept a normalized company and a source record, not “Norway-shaped” arguments.

That keeps new countries from needing their own bespoke SQL path unless the data model genuinely differs.

---

## 6. How to plug in a new country without chaos

When adding Denmark, Finland, France, etc., follow this exact sequence.

## Step 1 — source intake first
Create/update `data-sources/SOURCE_REGISTRY.md` entry with:
- source name
- legal basis
- license tag
- access method
- expected coverage
- seed vs delta strategy
- known restrictions

If legal/commercial reuse is unclear, stop there.

## Step 2 — define source code and registry metadata
Create country-local source definition, for example:

- `dk_cvr`
- `fi_prh`
- `fr_sirene`

Include run mode expectations and attribution metadata.

## Step 3 — implement fixture mode first
Before touching live APIs/bulk:
- add 2–5 realistic fixtures
- implement normalizer against those fixtures
- confirm contract shape is stable

That avoids burning time on auth/paging while the mapping is still moving.

## Step 4 — implement live sample mode second
Add the smallest safe real-data path possible:
- explicit IDs if needed
- strict low limits
- provenance metadata
- no broad crawling by default

This mirrors the current Norway/UK approach and is the right discipline.

## Step 5 — wire generic ingest lifecycle
The new country should be able to:
- register its source
- create an ingest run
- fetch
- normalize
- validate
- upsert
- mark run complete

without adding a brand new control flow tree.

## Step 6 — only then add seed/delta modes
Once sample runs work and normalization is stable:
- add full seed mode
- add checkpointed delta mode
- add admin/runbook docs

## Step 7 — add country acceptance checklist
A country is not “added” until all are true:
- legal review captured
- source registry row defined
- fixture mode works
- live sample mode works
- normalized contract validated
- ingest run recorded in DB
- source-backed company rows visible in API
- runbook doc exists

---

## 7. Recommended next concrete repo changes

These are the best next pragmatic changes after Norway.

## Priority 1 — make source definitions first-class
Replace country-specific DB registry helpers with a shared source-definition model.

Example direction:
- add `shared/source_registry.py` dataclass/helper
- each country exposes one `SOURCE_DEFINITION`
- shared helper upserts it into `source_registry`

## Priority 2 — make ingest runs real
The current Norway `ingest-db` path should start creating/updating `ingestion_runs` rows.

Minimum useful behavior:
- create `running` row at start
- store run type such as `fixture_sample` or `live_sample`
- update `records_seen`, `records_written`, `records_failed`
- mark final status

## Priority 3 — add contract validation
Introduce a tiny shared validator for `NormalizedCompany` payload shape.

## Priority 4 — generalize DB upsert path
Rename the mental model from “Norway DB ingest” to “normalized company ingest”.

## Priority 5 — document country onboarding checklist in repo root docs
Make this workflow visible so future additions follow the same path by default.

---

## 8. Recommended operating principles

1. **One country can have multiple source streams.**
   - company core, officers, filings, changes should be separable
2. **Raw source truth must remain recoverable.**
   - normalization bugs happen; replays should be possible
3. **Sample mode is not production mode.**
   - useful for validation, useless as long-term ingestion architecture
4. **Normalization contract beats source convenience.**
   - adapters bend to the contract; the contract should not drift per country
5. **Shared lifecycle beats bespoke scripts.**
   - the second country is where habits become architecture

---

## 9. Suggested Denmark-first application

If Denmark is next, the clean approach is:

1. create source intake entry for CVR/Virk
2. add `ingest_denmark/`
3. implement fixture payloads
4. emit the exact same normalized contract
5. add source definition `dk_cvr`
6. wire into shared ingest run lifecycle
7. expose 2–3 ingested Denmark rows through existing search API

If that flow feels awkward, the architecture still needs work.

That is the right test: **a new country should feel repetitive, not improvisational**.
