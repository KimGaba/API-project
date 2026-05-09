# Masterplan — European Company Data Platform

## Executive summary
The strongest MVP is **not** all of Europe. The strongest MVP is a legally safer, technically achievable, commercially sellable subset.

### Recommended MVP direction
- Start with **Norway + United Kingdom**
- Add **Denmark** in phase 1.5 / phase 2
- Add **Finland** later unless licensing/data access improves

### Why
- **Norway** gives the cleanest early legal and operational foundation
- **UK** gives rich field coverage and strong product value
- Together they are enough to validate ingestion, normalization, API sales, billing, and usage controls

---

## Product strategy
Build a **business data platform first**, then monetize via API.

### Initial product promise
- company search
- company lookup
- registration number lookup
- VAT lookup where lawful/available
- change tracking later

### Commercial model
- Free: 100 requests/month
- Starter: 10,000 requests/month
- Growth: 100,000 requests/month
- Enterprise: custom/bulk/SLA

---

## Legal and licensing strategy
This project lives or dies on source rights.

### Core rule
"Publicly accessible" is **not enough**.
Only use sources with sufficiently clear commercial reuse and redistribution rights, ideally official bulk/API/open-data channels.

### Approval framework
- **Green**: explicit commercial reuse + redistribution clarity
- **Yellow**: unclear rights, operational dependence, or privacy concerns
- **Red**: clear prohibition, contract friction, or scraping-only fragile access

### Mandatory source intake fields
For every source track:
- legal owner
- source URL/API
- access method
- license name
- commercial reuse allowed?
- redistribution allowed?
- attribution required?
- personal data risk
- scraping restrictions
- bulk allowed?
- update cadence
- operational reliability

---

## Technical strategy
### Recommended architecture
- Python workers for ingestion and normalization
- TypeScript API (Fastify or NestJS)
- PostgreSQL as system of record
- Redis for quotas, caching, and rate limits
- Stripe for billing
- monorepo structure
- one EU-region deployment

### API architecture recommendation
Use a **modular monolith** for the API, not microservices.
Separate ingestion workers from the API surface.

---

## MVP build order
### Phase 0 — Foundations
1. source registry and legal intake workflow
2. database schema
3. auth model and API keys
4. usage metering model
5. developer docs skeleton

### Phase 1 — Norway + UK MVP
1. source connectors
2. raw payload storage
3. normalization pipeline
4. company search + lookup API
5. Stripe billing
6. free tier quota enforcement
7. customer dashboard

### Phase 1.5
- add Denmark
- harden normalization rules
- improve match quality

### Phase 2
- change tracking
- alerts/webhooks
- VAT/registration validation improvements
- more countries

---

## Recommended repo/service structure
- apps/api
- apps/dashboard
- apps/docs
- workers/ingest-norway
- workers/ingest-uk
- packages/db
- packages/common
- packages/billing
- packages/licensing
- infra/docker

---

## What not to build yet
- all-Europe coverage
- Elasticsearch/OpenSearch from day 1
- complex microservices
- AI enrichment as core value
- bulk exports on free plan
- scraping-first strategy

---

## Recommended immediate next build steps
1. Scaffold the monorepo
2. Add Postgres + Redis + API service + ingestion worker containers
3. Implement schema v1
4. Build Norway source connector first
5. Build UK source connector second
6. Expose search + company detail endpoints
7. Add Stripe + quota accounting
8. Add customer dashboard

---

## Final recommendation
If we want the fastest realistic path to revenue, we should build a **Norway + UK business registry API MVP** with strong licensing discipline, a modular monolith API, and a Python-based ingestion pipeline.
