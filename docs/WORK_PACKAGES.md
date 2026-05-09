# Work Packages for Parallel Agents

## WP-01 Public site polish
Scope:
- improve landing/docs/playground cohesion
- tighten sections, copy, CTA hierarchy
- keep public/docs concerns in the public surface

## WP-02 Dashboard shell
Scope:
- evolve the real user-area frontend in `apps/dashboard`
- build layout, nav, overview pages
- no full auth required yet

## WP-02B Admin shell
Scope:
- create `apps/admin`
- build operator-facing layout and navigation
- separate admin concerns from public/docs/user area

## WP-03 Auth groundwork
Scope:
- choose local auth approach
- define user flows
- create minimal implementation plan or scaffold

## WP-04 API key + usage path
Scope:
- DB-backed API key lookup
- middleware path
- write usage event/counter path

## WP-05 Norway live ingest visibility
Scope:
- get live Norway sample into DB
- make sure API search can surface it
- reduce workaround debt if possible

## WP-06 UK authenticated test path
Scope:
- improve authenticated sample flow
- validate docs/runbook/helper tooling
- no secrets hardcoded

## WP-07 Billing groundwork
Scope:
- Stripe integration skeleton
- product/price modeling
- webhook event storage flow

## WP-08 Docs & onboarding polish
Scope:
- quickstart clarity
- onboarding examples
- API examples and error states

## WP-09 Admin/status tooling
Scope:
- ingestion status visibility
- source registry visibility
- latest run summaries

## WP-10 Search/product UX
Scope:
- search filters
- better response formatting
- example data quality improvements
