# Project Surface

## Internal surface snapshot

This is now the internal control surface direction for the current MVP. It still exposes execution planning, but its main job is to give the team one pragmatic internal destination for operator/admin/backend visibility on `3014`.

It is **not**:
- a product demo
- a customer workspace
- a polished public narrative
- a reason to keep long-term internal control split across separate admin/project destinations

## Surface role boundaries

- **Public** = product story, trust, pricing, docs entry, safe demo
- **Dashboard** = signed-in customer self-service
- **Internal control surface (`3014`)** = internal operator control, backend visibility, customer/billing/admin inspection, and planning visibility
- **Legacy admin (`3013`)** = deprecated migration-era internal shell

## Internal planning rules

Keep planning strictly internal and execution-focused.
- show work, blockers, review asks, and release state
- keep card titles concrete and implementation-oriented
- prefer source-backed status over aspirational status
- no customer/admin/public role confusion
- keep planning visible without letting it dominate operator control workflows

## Backlog

### B-04 Wire dashboard shell to real API data
- **Area:** dashboard
- **Priority:** P2
- **Why now:** shell exists, but it is still mostly scaffolding.
- **Scope:**
  - usage snapshot hookup
  - API key list placeholder to real data shape
  - overview metrics based on current API/DB
- **Done when:** dashboard overview shows live local data instead of only placeholders.

### B-05 Build internal control surface beyond basic status page
- **Area:** admin / ops
- **Priority:** P2
- **Why now:** internal groundwork exists; next value is converging operator visibility on `3014`.
- **Scope:**
  - ingestion run summaries
  - source registry visibility
  - latest sync / health summaries
  - customer/billing/platform inspection framing that belongs to the internal surface
- **Done when:** operators can use `3014` as the default place to inspect source, ingestion, and platform state.

### B-06 Stripe billing skeleton expansion
- **Area:** billing / api
- **Priority:** P2
- **Why now:** groundwork exists, but subscriptions/plans are not yet end-to-end.
- **Scope:**
  - checkout/session flow
  - webhook event storage hardening
  - subscription state sync
- **Done when:** billing flow is structurally complete in local/dev mode.

### B-07 Auth implementation after direction doc
- **Area:** auth / dashboard
- **Priority:** P2
- **Why now:** auth direction exists, but current MVP should not over-rotate here yet.
- **Scope:**
  - local auth scaffold
  - protected route plan
  - basic signup/login path if still aligned with MVP
- **Done when:** dashboard access has a realistic local auth path.

### B-08 Denmark source intake and connector planning
- **Area:** data / legal / roadmap
- **Priority:** P2
- **Why now:** valuable next-country candidate once Norway + UK are stronger.
- **Scope:**
  - legal/source validation
  - connector plan
  - normalization mapping notes
- **Done when:** Denmark is ready to move from plan to implementation.

### B-09 Internal planning persistence + editing
- **Area:** project
- **Priority:** P2
- **Why now:** useful follow-up only if planning remains valuable inside the broader internal control surface.
- **Scope:**
  - lightweight board state storage
  - internal editing model
  - basic workflow updates without a heavy PM tool
- **Done when:** planning inside `3014` can be updated without hand-editing seed data.

## In Progress

### IP-01 Public site cleanup and cohesion pass
- **Area:** public
- **Priority:** P1
- **Current status:** site already moved toward SaaS/API product feel, but `site/index.html` still needs cleanup so landing, docs, and demo fit together cleanly.
- **Scope:**
  - tighten structure/copy
  - improve CTA hierarchy
  - smooth docs/demo flow
- **Done when:** public page reads as one coherent product surface.

### IP-02 Norway live ingest to DB and search visibility
- **Area:** data / api
- **Priority:** P1
- **Current status:** live Norway safe-mode worker and DB ingest path exist; sample ingest has been validated.
- **Scope:**
  - continue normalization cleanup
  - reduce Norway-only ingest debt
  - improve visibility through search responses
- **Done when:** live Norway data is reliably ingested and clearly surfaced via API search.

### B-01 Implement shared country ingest framework
- **Area:** data / workers / db
- **Priority:** P1
- **Why now:** Norway works, but the ingest path is still too country-specific.
- **Scope:**
  - shared source definition/upsert model
  - `ingestion_runs` bookkeeping
  - normalized contract validation
  - generalized DB ingest path beyond Norway-only code
- **Done when:** at least Norway and one additional connector can use the shared ingest pattern.

### B-02 Search quality pass: ranking + exact lookup + richer results
- **Area:** api / search / product
- **Priority:** P1
- **Why now:** live data is appearing; search needs to feel more product-grade.
- **Scope:**
  - improve ranking behavior
  - add/finish exact registration lookup path
  - improve result depth/formatting
- **Done when:** common searches return visibly better ordering and detail.

## Review

### R-01 UK live authenticated sample test
- **Area:** data / workers
- **Priority:** P1
- **Current status:** runbook and helper CLI are ready; execution is blocked on real `COMPANIES_HOUSE_API_KEY`.
- **Blocker:** missing live API key.
- **Review ask:** once key is available, run one successful raw + normalized sample and capture outcome.
- **Done when:** UK live sample path is proven end-to-end.

### R-02 API key + usage groundwork verification
- **Area:** api / auth / billing
- **Priority:** P1
- **Current status:** DB-backed API key validation and usage accounting path were added, with seeded demo customer/key.
- **Review ask:** verify middleware coverage, usage writes, and expected behavior on non-demo/local flows.
- **Done when:** team is comfortable treating DB-backed API key flow as the default path.

### R-03 Dashboard shell review
- **Area:** dashboard
- **Priority:** P2
- **Current status:** dashboard scaffold exists with overview, API keys placeholder, usage snapshot, billing placeholder, docs handoff, and local search panel.
- **Review ask:** confirm structure, routes, and whether the shell is ready for data hookup instead of more layout work.
- **Done when:** dashboard moves cleanly from shell to implementation tasks.

### R-04 Internal surface review
- **Area:** admin
- **Priority:** P2
- **Current status:** legacy admin app and `/v1/admin/status` route exist, plus static `site/admin.html`, while `3014` is the newer canonical direction.
- **Review ask:** confirm whether the migration framing is clear enough that internal implementation can converge on `3014` without surface ambiguity.
- **Done when:** internal implementation can continue with `3014` as the clear default destination.

## Deployed

### D-01 Local API MVP surface
- **Area:** api
- **Priority:** P1
- **Status:** deployed locally and verified.
- **Available now:**
  - `GET /health`
  - `GET /v1/meta/countries`
  - `GET /v1/companies/search`
- **Notes:** demo API key available locally via seeded/dev flow.

### D-02 Public docs/demo site
- **Area:** public
- **Priority:** P1
- **Status:** deployed locally as a static project/docs/demo site.
- **Available now:** SaaS/API-style landing experience with interactive playground and improved result cards/summary states.

### D-03 Admin status endpoint and static admin page
- **Area:** admin
- **Priority:** P2
- **Status:** deployed locally.
- **Available now:**
  - `GET /v1/admin/status`
  - `site/admin.html`
- **Notes:** transitional support only; not the preferred long-term internal destination.

### D-04 Billing scaffold endpoints
- **Area:** billing / api
- **Priority:** P2
- **Status:** deployed locally as scaffold-only.
- **Available now:**
  - `GET /v1/billing/plans`
  - `POST /v1/billing/webhooks/stripe`
- **Notes:** no live Stripe secrets or external writes intended yet.

## Done

### DN-01 MVP direction chosen
- **Area:** strategy
- **Priority:** P1
- **Outcome:** Norway selected as strongest first real source, UK second, Denmark later, Finland later.

### DN-04 Norway DB ingest path implemented
- **Area:** data / db
- **Priority:** P1
- **Outcome:** `ingest-db` upserts into `companies`, `company_addresses`, `company_activities`, and `source_records`; sample ingest validated.

### DN-06 API key and usage groundwork added
- **Area:** api / auth / billing
- **Priority:** P1
- **Outcome:** DB-backed validation path and usage counters/events groundwork added with demo seed data.

### DN-07 Dashboard shell scaffolded
- **Area:** dashboard
- **Priority:** P2
- **Outcome:** initial dashboard app exists and is runnable locally after install.

### DN-09 UK live test path documented
- **Area:** data / docs
- **Priority:** P1
- **Outcome:** runbook + helper CLI exist; only secret input is missing.

## Suggested next pull order

1. **IP-01 Public site cleanup and cohesion pass**
2. **R-01 UK live authenticated sample test** (as soon as API key exists)
3. **IP-02 Norway live ingest to DB and search visibility**
4. **B-01 Implement shared country ingest framework**
5. **B-02 Search quality pass: ranking + exact lookup + richer results**
6. **R-02 API key + usage groundwork verification**
7. **R-03 Dashboard shell review**
8. **R-04 Internal surface review**
9. **B-05 Build internal control surface beyond basic status page**

## Notes
- Keep the board honest: only mark live paths as deployed when they are actually runnable locally.
- Norway + UK data quality still matters more than adding more surface area.
- Auth, billing, and dashboard work should continue, but not at the expense of the core ingestion/search MVP.
