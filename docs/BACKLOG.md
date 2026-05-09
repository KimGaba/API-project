# Backlog — European Company Data Platform

## NOW

### A1. Public site polish (`apps/site` target, currently `site/`)
**Goal:** Make the public-facing page feel like a real API product.
**Includes:** landing, product framing, pricing teaser, docs entry, playground polish.
**Definition of done:** coherent site with clear CTA, docs entry, and working demo.

### A2. Dashboard shell (`apps/dashboard`)
**Goal:** Create the first real user-area frontend shell.
**Includes:** app layout, nav, overview page, placeholders for auth/keys/usage/billing.
**Definition of done:** runnable frontend shell with internal navigation.

### A2b. Admin app shell (`apps/admin`)
**Goal:** Create a separate internal admin surface.
**Includes:** users, billing, API usage, sources, ingestion runs, database/status shell.
**Definition of done:** runnable admin shell with internal navigation.

### A3. Auth groundwork
**Goal:** Introduce user/account model and local auth approach.
**Includes:** signup/login plan or local placeholder auth, protected routes plan.
**Definition of done:** documented auth direction and basic working local auth scaffold.

### A4. API keys + quotas groundwork
**Goal:** Move from demo key to real API key validation and usage accounting.
**Includes:** DB-backed API keys, middleware, usage write path, quota/rate-limit plan.
**Definition of done:** at least one DB-backed API key path working locally.

### A5. Norway live ingest to DB
**Goal:** Continue the live Norway path into Postgres.
**Includes:** safe sample ingest, normalization cleanup, search visibility.
**Definition of done:** live Norway sample visible via API search.

### A6. UK live readiness
**Goal:** Prepare and verify authenticated Companies House sample flow.
**Includes:** runbook, helper CLI, env handling, sample company test flow.
**Definition of done:** ready-to-run authenticated UK sample path.

## NEXT

### B1. Billing / Stripe skeleton
- checkout/session flow
- webhook processing
- subscription state sync

### B2. Usage dashboard
- request counts
- quota bars
- plan visibility

### B3. Search improvements
- country filters
- exact registration lookup path
- result ranking

### B4. Source status/admin tooling
- ingestion runs
- source health
- latest sync info

## LATER

### C1. Full service frontend
- API key creation UX
- request logs
- customer settings
- invoice/billing views

### C2. Denmark integration
- legal + source connector + normalization

### C3. Finland integration
- connector + source evaluation

### C4. Change tracking API
- entity change history
- recent updates endpoint

## BLOCKED

### X1. UK authenticated live test
Blocked by: Companies House API key not yet supplied.

## Notes
- Prioritize Norway + UK before broadening geography.
- Avoid overbuilding auth/billing before API/data path is stronger.
- Keep docs honest: only show live functionality as live.
