# MVP Technical Architecture Research

## Goal
Build a practical MVP for a **European company data API** that can:
- ingest and normalize company data from a small set of European sources
- expose a paid API with API keys
- enforce a free tier and usage limits
- support Stripe subscriptions and self-serve upgrades
- stay simple enough for a small team to ship in weeks, not months

This document recommends a **lean architecture that is production-capable**, but deliberately avoids premature complexity.

---

## 1. Recommended MVP architecture

### Core principle
For MVP, use a **modular monolith plus workers** rather than microservices.

That means:
- one TypeScript API app
- one Python ingestion codebase
- one PostgreSQL database
- one Redis instance
- one Stripe webhook handler inside the API app or as a small companion worker
- optional lightweight admin UI later

This gives clear separation by responsibility without the operational pain of many independently deployed services.

### Why this is the right MVP shape
- **Python** is the right tool for ETL, scraping, parsing, cleaning, and registry-specific ingestion.
- **TypeScript** is ideal for customer-facing API, auth, billing, rate limiting, and developer tooling.
- **PostgreSQL** can handle transactional data, normalized records, and search well enough at MVP scale.
- **Redis** is enough for rate limits, short-lived caching, and lightweight job coordination.
- **Stripe** removes the need to build billing logic from scratch.

Avoid for MVP:
- Kafka
- OpenSearch/Elasticsearch unless search quality becomes unacceptable
- Kubernetes unless there is already platform expertise and strong reason
- event-driven multi-service sprawl

---

## 2. High-level system design

```text
Data Sources (registry APIs / dumps / CSV / scrape)
        |
        v
Python Ingestion Workers
  - fetch
  - parse
  - normalize
  - dedupe
  - upsert
        |
        v
PostgreSQL <---- Redis ----> TypeScript API
   |              |             - auth via API keys
   |              |             - quotas
   |              |             - rate limits
   |              |             - search/lookup endpoints
   |              |
   |              +--> background jobs / cache / usage counters
   |
   +--> raw source metadata + change tracking

Stripe Checkout / Billing Portal
        |
        v
Stripe Webhooks --> API billing module --> subscriptions / quotas in PostgreSQL
```

---

## 3. Service breakdown

## A. TypeScript API service
Recommended stack:
- **Node.js + TypeScript**
- **Fastify** for the API framework
- **Prisma** or **Drizzle** as ORM/query layer
- **Zod** for request/response validation

Why Fastify over NestJS for MVP:
- lower ceremony
- faster to ship
- good plugin ecosystem
- still structured enough for a serious product

Responsibilities:
- API key authentication
- plan/quota enforcement
- per-minute rate limiting
- search and lookup endpoints
- usage metering
- Stripe checkout session creation
- Stripe webhook processing
- account/subscription state management
- API response shaping by plan

Suggested API endpoints for MVP:
- `GET /v1/companies/search?q=&country=`
- `GET /v1/companies/{id}`
- `GET /v1/companies/registration/{country}/{number}`
- `GET /v1/companies/vat/{vat}`
- `GET /v1/meta/countries`
- `GET /v1/account/usage`
- `POST /v1/billing/create-checkout-session`
- `POST /v1/stripe/webhook`
- `GET /health`

Defer until post-MVP:
- bulk endpoints
- change feed endpoints if source freshness is not ready
- customer dashboard beyond basics
- OAuth

---

## B. Python ingestion service
Recommended stack:
- **Python 3.12+**
- **httpx** for HTTP
- **pydantic** for validation
- **psycopg** or **SQLAlchemy Core** for DB writes
- **pandas/polars** only where batch parsing really benefits
- **Typer** for CLI commands

Responsibilities:
- source-specific connectors per country/source
- scheduled fetches
- parsing raw source payloads
- normalization into canonical schema
- confidence scoring / provenance capture
- idempotent upserts into PostgreSQL
- optional raw payload storage to filesystem or S3-compatible bucket

Recommended ingestion pipeline stages:
1. **Fetch** raw data from source
2. **Persist raw artifact** with metadata
3. **Parse** source format into source-level structured records
4. **Normalize** to canonical company schema
5. **Deduplicate / identify company**
6. **Upsert canonical tables**
7. **Write source_records and change_log**
8. **Emit ingestion metrics/logs**

Important MVP design choice:
- keep ingestion jobs **country-specific and idempotent**
- do not try to create one giant universal parser abstraction too early

Suggested command structure:
- `python -m ingest fetch dk_cvr`
- `python -m ingest sync uk_companies_house`
- `python -m ingest backfill no_brreg`
- `python -m ingest verify-source <source>`

---

## C. PostgreSQL
PostgreSQL is the system of record.

Use it for:
- canonical company data
- source provenance
- account/billing state
- API keys
- usage events
- search indexes
- change tracking

Recommended extensions/features:
- `pg_trgm` for fuzzy search on company names
- `citext` for case-insensitive fields if useful
- JSONB for source metadata and flexible source payload summaries

Search strategy for MVP:
- exact matches on identifiers
- trigram/ILIKE search on normalized names
- country filtering
- ordering by relevance + source confidence

Do **not** add OpenSearch at MVP unless:
- search latency becomes poor
- ranking quality is clearly insufficient
- dataset volume grows beyond what PostgreSQL handles comfortably

---

## D. Redis
Use Redis for a small number of high-value tasks:
- per-key rate limiting counters
- short-lived response caching for hot lookups/searches
- queue backing if using BullMQ on the API side
- usage aggregation buffer if needed

Do not make Redis the source of truth for billing or quotas.
PostgreSQL remains authoritative.

---

## E. Stripe billing
Use Stripe for:
- checkout
- customer portal
- subscriptions
- invoices
- payment method management
- webhook events

Recommended Stripe model:
- one product per plan family
- recurring monthly prices for Free/Starter/Growth as applicable
- free plan represented in your own DB, not necessarily as a Stripe subscription

Webhook events to handle:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Billing rules:
- plan state is updated via webhooks
- API behavior should degrade safely if billing is uncertain
- usage resets should be based on a clear billing period stored in DB, not only on webhook timing

---

## 4. Data model recommendations

The draft schema is strong. For MVP, I would refine it into these groups.

### Canonical company data
- `companies`
- `company_identifiers`
- `company_addresses`
- `company_activities`
- `company_officers`
- `change_log`
- `source_records`

### Customer/billing/auth data
- `customers`
- `subscriptions`
- `api_keys`
- `usage_counters`
- `usage_events`
- `webhook_events` (for idempotent Stripe processing)

### Operational data
- `ingestion_runs`
- `source_registry`
- `raw_artifacts` (or metadata table if raw files are stored externally)

### Strong recommendation: add a `customers` table
Even if not in the draft yet, add:
- `customers.id`
- `email`
- `name`
- `created_at`
- `stripe_customer_id`
- `default_plan`
- `status`

This makes auth, billing, and key ownership much cleaner.

### Strong recommendation: add `usage_counters`
`usage_events` alone is not ideal for hot-path checks.

Use:
- `usage_events` for audit/history
- `usage_counters` for current monthly totals by customer/api_key/endpoint group

Example fields:
- `customer_id`
- `api_key_id`
- `period_start`
- `period_end`
- `requests_count`
- `search_requests_count`
- `lookup_requests_count`
- `updated_at`

The API can increment counters efficiently and still write summarized events asynchronously.

---

## 5. Auth, API keys, free tier, and usage limits

## API key model
For MVP:
- generate opaque keys like `cdp_live_xxx`
- store only a **hash** in the database
- show the raw key once at creation time
- support multiple keys per customer later, but MVP can start with one active key

Key fields:
- id
- customer_id
- key_prefix
- key_hash
- label
- active
- created_at
- last_used_at
- revoked_at

Hashing:
- use a secure one-way hash, not encryption
- compare in constant time where practical

## Request auth flow
1. Client sends API key
2. API hashes incoming key and looks up matching record
3. Check key is active
4. Load customer + subscription/plan
5. Check monthly quota
6. Check per-minute rate limit in Redis
7. Execute request
8. Increment usage counters and log event

## Free tier recommendation
From existing docs:
- 100 requests/month
- 5 requests/minute
- search + single company lookup only

That is reasonable for MVP.

I would add two guardrails:
- cap search result size for free plan, e.g. 10 results/page
- return fewer enrichment fields for free users

## Quota enforcement pattern
Use a two-layer approach:

### Layer 1: hard RPM limit in Redis
Example Redis key:
- `ratelimit:{api_key_id}:{minute_bucket}`

This is fast and avoids DB pressure.

### Layer 2: monthly quota in PostgreSQL
Use `usage_counters` as source of truth.
Optionally mirror recent increments in Redis and flush asynchronously if traffic grows.

For MVP traffic, direct DB increments are fine if done carefully.

---

## 6. Search and query design

### Recommended MVP search behavior
Support:
- exact lookup by internal ID
- exact lookup by registration number + country
- exact lookup by VAT
- name search with country filter

### PostgreSQL indexing strategy
At minimum:
- unique or near-unique index on `(country_code, registration_number)` where possible
- index on `vat_number`
- trigram index on `normalized_name`
- index on `country_code`
- index on `company_identifiers(identifier_type, identifier_value)`

### API response model
Return:
- canonical company fields
- identifiers
- addresses
- activities
- provenance summary

Avoid returning raw source payloads in public API for MVP.
Keep that internal/admin-only.

---

## 7. Ingestion architecture details

## Source strategy
The existing plan recommends Denmark, UK, Norway, Finland first. That is sensible.

For strict MVP execution, I would suggest:
- **Phase 1 live countries:** Denmark + UK
- **Phase 1.5:** Norway
- **Phase 2:** Finland + another high-value source

Reason:
- two countries are enough to validate the schema, ingestion flow, and billing mechanics
- more countries create legal/data quality overhead quickly

## Source connector pattern
Each source should have:
- `client.py` for fetch logic
- `parser.py` for source-to-structured parsing
- `normalizer.py` for canonical mapping
- `tests/fixtures` for real sample data
- `metadata.yml` with license/update cadence/coverage notes

## Idempotency rules
Every ingestion run should be restart-safe.
Use:
- deterministic source record keys
- upserts, not blind inserts
- ingestion run tracking table
- stored checkpoints for pagination/backfills

## Raw data retention
For MVP:
- keep raw payloads for audit/debugging
- store large raw files in object storage or compressed filesystem archive
- store only references and metadata in PostgreSQL when payloads are large

---

## 8. Recommended repo structure

Use a **monorepo**. It is the cleanest setup for a small product team with shared schema/contracts.

```text
company-data-project/
  apps/
    api/
      src/
        modules/
          auth/
          companies/
          billing/
          usage/
          admin/
          health/
        plugins/
        lib/
      test/
      package.json
    ingest/
      src/
        common/
        sources/
          dk_cvr/
          uk_companies_house/
          no_brreg/
          fi_prh/
        pipelines/
        db/
        cli/
      tests/
      pyproject.toml
    web/
      src/
      package.json
  packages/
    db/
      prisma/ or drizzle/
      migrations/
      seed/
    shared-types/
      src/
    config/
      eslint/
      tsconfig/
  infra/
    docker/
    terraform/ or pulumi/
    fly/ or railway/ or render/
  docs/
    API_PRODUCT.md
    DATABASE_SCHEMA.md
    PROJECT_PLAN.md
  research/
    MVP_TECH_RESEARCH.md
  scripts/
    bootstrap.sh
    dev.sh
  docker-compose.yml
  pnpm-workspace.yaml
  README.md
```

### Why monorepo works well here
- shared API schemas/types
- unified CI/CD
- one place for infrastructure and docs
- easier local development with Docker Compose
- simpler onboarding

### Package manager recommendation
- **pnpm** for Node/TypeScript workspace
- **uv** or **poetry** for Python dependency management

If the team wants fewer tools, use:
- pnpm for JS
- uv for Python

That is a practical combination.

---

## 9. Deployment model

## Best MVP deployment choice
Use a **single European cloud region** with managed data services where possible.

Recommended region examples:
- AWS eu-central-1 (Frankfurt)
- AWS eu-west-1 (Ireland)
- Hetzner Germany/Finland
- Scaleway Paris

### Practical deployment recommendation
For MVP, I recommend one of these two models:

## Option A: Small-team fastest path
- API app in container hosting platform
- ingestion worker in same platform as separate worker process
- managed PostgreSQL
- managed Redis
- S3-compatible bucket for raw data
- Stripe hosted externally

Works well on:
- Render
- Railway
- Fly.io
- Northflank

Best if the goal is speed and low DevOps overhead.

## Option B: Lower-cost, more control
- single EU VPS for app containers
- managed PostgreSQL preferred, or Postgres on a dedicated VM if necessary
- Redis either managed or on same private network
- object storage for raw source files
- reverse proxy + TLS

Best if budget is tight and the team can handle ops.

### My recommendation
For a paid data API MVP, prefer:
- **managed PostgreSQL**
- **managed Redis**
- containers for API and workers
- deploy both in the same EU region

This reduces failure modes around backups, replication, and patching.

---

## 10. Runtime topology

### MVP production topology
- `api` container
- `ingest-worker` container
- `scheduler` process or platform cron for ingestion jobs and monthly resets
- managed `postgres`
- managed `redis`
- object storage bucket

Optional:
- `web` marketing/docs app
- `admin` internal dashboard behind auth

### Scheduler recommendation
Do not build a full internal scheduler first.
Use:
- platform cron jobs
- GitHub Actions scheduled workflow for non-sensitive tasks
- or a lightweight worker beat process

Typical scheduled jobs:
- nightly ingestion by source
- retry failed ingestion runs
- usage period rollover/reset
- stale cache cleanup

---

## 11. Observability and operations

For MVP, implement the minimum serious set:

### Logging
- structured JSON logs
- request ID / correlation ID
- ingestion run IDs
- Stripe event IDs

### Metrics
Track at least:
- API latency by endpoint
- API error rate
- rate-limited requests
- quota-exceeded requests
- ingestion job success/failure
- source freshness per country/source
- DB query latency

### Alerts
Alert on:
- API downtime
- ingestion failures for key sources
- Stripe webhook failures
- database connection saturation
- large queue backlogs if queues are used

### Sentry/exception tracking
Strongly recommended for both API and ingestion.

---

## 12. Security and compliance notes

Because this is a European company data product, keep the MVP compliance posture sane from day one.

### Minimum security controls
- store only hashed API keys
- secrets in managed secret store or environment variables via platform
- TLS everywhere external
- private DB networking where possible
- least-privilege DB users for API vs ingestion if practical
- audit Stripe webhook signature validation
- row-level internal auditability via `created_at`, `updated_at`, provenance fields

### Data licensing and provenance
This matters as much as the tech.
For every source, track:
- legal owner
- license terms
- whether commercial reuse is allowed
- attribution obligations
- refresh cadence
- data confidence/coverage

This should be first-class in the product, not an afterthought.

### GDPR / privacy nuance
Company data is often public, but officer/person fields can still create privacy obligations.
Keep:
- clear source provenance
- documented lawful basis and licensing review
- ability to suppress or correct records if required

Not full legal advice, but architecturally you should preserve provenance and change history.

---

## 13. Suggested implementation order

## Phase 0 — foundation (week 1)
Ship the skeleton before feature depth.

Build:
- monorepo setup
- Docker Compose local stack
- PostgreSQL schema migrations
- Fastify API skeleton
- Python ingestion CLI skeleton
- Redis wiring
- basic CI for lint/test/build

Deliverable:
- `GET /health`
- local dev environment works end-to-end

## Phase 1 — core data + first source (weeks 2-3)
Build:
- canonical schema tables
- one source connector for Denmark or UK
- raw ingestion + normalization + upsert flow
- company search endpoint
- company detail endpoint
- registration lookup endpoint

Deliverable:
- live searchable data for first country

## Phase 2 — auth, usage, and billing (weeks 3-4)
Build:
- customers table
- API key issuance and auth middleware
- plan definitions
- Redis RPM limiter
- PostgreSQL monthly quota checks
- Stripe checkout + webhook sync
- usage endpoint for customers

Deliverable:
- free tier and paid tier work end-to-end

## Phase 3 — second source/country + operational hardening (weeks 4-6)
Build:
- second country/source
- source registry tracking
- ingestion runs table
- webhook event idempotency
- better search ranking/indexes
- caching for hot paths
- monitoring/error tracking

Deliverable:
- meaningful cross-country MVP

## Phase 4 — polish for launch (weeks 6-8)
Build:
- docs portal / OpenAPI
- customer billing portal link
- admin review tools
- attribution display in API responses/docs
- backup/restore runbook
- launch checklist and support process

Deliverable:
- sellable MVP

---

## 14. What not to build yet

These are tempting, but should wait unless there is a customer forcing function:
- Kubernetes
- microservices by domain
- OpenSearch cluster
- complex event streaming
- per-customer custom schemas
- full self-serve admin UI
- real-time change feeds across all countries
- over-engineered data mastering entity graph

The biggest MVP risk is not technical scale. It is **shipping too much before validating source quality, licensing, and customer demand**.

---

## 15. Concrete recommendation summary

If I were building this MVP, I would choose:

### Stack
- **API:** TypeScript + Fastify + Prisma/Drizzle
- **Ingestion:** Python + httpx + pydantic + psycopg
- **DB:** PostgreSQL
- **Cache/rate limits:** Redis
- **Billing:** Stripe
- **Storage:** S3-compatible bucket for raw files
- **Hosting:** one EU region, containers + managed Postgres/Redis

### Architecture style
- modular monolith API
- separate ingestion worker codebase in same monorepo
- shared database
- Redis only for fast-path operational concerns

### First countries
- Denmark
- United Kingdom

### First monetized feature set
- API keys
- free tier
- monthly quotas
- RPM rate limits
- search
- company lookup
- registration lookup
- VAT lookup if source quality is strong enough

### Best MVP deployment
- managed Postgres
- managed Redis
- API container
- worker container
- platform cron
- EU region only

---

## 16. Final opinion

The right MVP is **not** a distributed data platform. It is a **reliable, legally aware, low-ops API product** with just enough ingestion sophistication to prove data value.

The winning move is:
- narrow country scope
- strong provenance
- simple billing
- fast API
- careful quota enforcement
- boring infrastructure

That will get to market much faster than trying to solve pan-European data engineering at full scale on day one.
