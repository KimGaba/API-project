# Dashboard/Admin Split Recommendation

## Recommendation in one sentence
**Yes: split both the customer dashboard and admin into more distinct views, but do it selectively.** The customer dashboard should stay fairly shallow with **5–7 primary views plus a few drill-down subviews**, while the admin should move to a **clear multi-view operations console** because its jobs are broader, denser, and less linear.

---

## Why this question matters now
The repo already has the right top-level surface split:
- `site/` = public/product/docs/demo
- `apps/dashboard` = signed-in customer self-service
- `apps/admin` = internal operator control surface
- `apps/project` = delivery/project board

That split is good and should stay.

The remaining question is **within** dashboard and admin: should each remain mostly a single-page shell with tabs/sections, or should they become more fully split into subpages/views?

My view: the current structure is a good scaffold, but it is already showing different needs on the two surfaces.

---

## Current state summary

### Customer dashboard today
`apps/dashboard/src/App.tsx` is effectively a **single app shell with one active section at a time**:
- Overview
- API Keys
- Usage
- Billing
- Docs
- Playground
- Settings

This is already a reasonable information architecture for customers. The content is focused, role-clean, and aligned with the docs in `docs/APP_STRUCTURE.md` and `docs/ROLE_CLEANUP_PLAN.md`.

### Admin today
`apps/admin/src/App.tsx` has more sections:
- Overview
- Customers
- Billing
- Platform usage
- Sources
- Ingestion runs
- Database
- System status

But the current overview still behaves like a **mission-control composite page** that re-renders many panels together. That works as a first pass, but admin usage will become much more operational and task-driven than the customer dashboard.

---

## Likely usage patterns for this product

## Customer dashboard usage pattern
For this product, most customers will come in to do a small set of repeat tasks:
1. copy or rotate an API key
2. check usage/quota
3. confirm plan/billing status
4. test a request
5. occasionally visit docs or settings

This is usually **narrow and self-service oriented**. Most users do not want a deep product tree. They want quick access to a few actions and fast confirmation that everything is working.

That means:
- too many pages would feel heavy
- too much nesting would slow common actions
- but some split is still valuable where actions become more complex (keys, billing, usage detail)

## Admin usage pattern
Internal operators will do more varied work:
1. scan overall health
2. investigate a source problem
3. inspect a failed ingestion run
4. review customer/account state
5. check billing/config mismatches
6. inspect DB/runtime signals
7. possibly trace issues across several panels in one session

This is **broader, denser, less linear, and more investigative**. Admin users tolerate more structure because they need precision, drill-down, filtering, and persistent context.

That means:
- a single big overview is not enough
- separate operational work areas will age better
- drill-down views matter much more than in customer dashboard

---

## Recommendation: customer dashboard

## Decision
**Split a little more, but keep it shallow.**

Do **not** turn the dashboard into a complex enterprise app yet. Keep the current top-level sections, but formalize them as real routes/views and add only a few subviews where users have repeated tasks.

## Why
The dashboard’s job is to support a tight customer workflow:
- start integration
- manage access
- monitor usage
- handle billing
- hand off to docs

That is naturally compact. The current section set is close to right already.

## Pros of splitting the dashboard into more views
- Direct linking becomes possible (`/usage`, `/keys`, `/billing`), which helps support, onboarding, and docs handoff.
- Easier future growth without turning `App.tsx` into one large stateful component.
- Better mental model: customers understand where to go for one job.
- Cleaner loading/data ownership per view.
- Lets you add detail screens later without cluttering Overview.

## Cons of over-splitting the dashboard
- Too many pages will make a simple self-service product feel heavier than it is.
- Users may have to click through multiple layers for common tasks like copying a key.
- Premature subpages can create maintenance overhead before auth/billing/data are fully real.

## Recommended dashboard page/view model

### Primary views
1. **Overview**
   - purpose: summary and next-best actions
   - include: current plan, requests used, API health signal, recent activity, quick actions
   - keep: lightweight and action-oriented

2. **API Keys**
   - purpose: create/copy/rotate/revoke credentials
   - include: key list, environment labels, last used, quick snippets
   - likely future subviews:
     - `API Keys > Create key`
     - `API Keys > Key details / rotation history`

3. **Usage**
   - purpose: monthly usage, endpoint mix, limits, trend visibility
   - include: request totals, quota bar, endpoint mix, maybe last 30 days trend later
   - likely future subviews:
     - `Usage > Requests`
     - `Usage > Limits & overages` (only if billing gets more detailed)

4. **Billing**
   - purpose: plan status, invoices, payment method, upgrade path
   - include now: current plan, quota entitlement, checkout status
   - future subviews:
     - `Billing > Plan`
     - `Billing > Invoices`
     - `Billing > Payment method`
   - note: these can begin as tabs/segments inside Billing until Stripe is real

5. **Playground**
   - purpose: test authenticated calls quickly
   - include: request runner, sample query, response preview
   - should stay separate from Docs because it is an action tool, not reference content

6. **Docs**
   - purpose: in-app handoff, quickstart, key reference links
   - keep this lightweight; it should mostly route users to the main docs surface

7. **Settings**
   - purpose: workspace/account basics, notifications, security, team access later
   - future subviews only when needed:
     - `Settings > Profile`
     - `Settings > Team`
     - `Settings > Security`

## Suggested customer dashboard structure
- `/overview`
- `/api-keys`
- `/usage`
- `/billing`
- `/playground`
- `/docs`
- `/settings`

### Optional secondary routes later
- `/api-keys/new`
- `/api-keys/:id`
- `/billing/invoices`
- `/settings/team`
- `/settings/security`

## Practical rule for dashboard
If a customer task is:
- **frequent + simple** → keep it in the main page
- **important + multi-step** → give it a subview or modal
- **rare + reference-like** → keep it lightweight or link outward

## Bottom line for dashboard
**Yes, split into real routed views; no, do not deeply subdivide yet.**
This should remain a compact self-service workspace, not a sprawling admin clone.

---

## Recommendation: admin

## Decision
**Yes, split the admin more aggressively.**

The admin should evolve from a “single mission control page with sections” into a **multi-view operations console** with a persistent Overview plus dedicated work areas and drill-down detail views.

## Why
Admin workflows are not just glance-and-go. They involve:
- monitoring
- investigation
- exception handling
- comparing entities across systems
- moving from summary to root cause

That naturally requires more separation.

## Pros of splitting the admin into more views
- Better support for operator investigation and triage.
- Less visual overload than one huge dashboard.
- Easier filtering, sorting, and detail states per domain.
- Cleaner distinction between summary views and workbench/detail views.
- Better long-term fit as ingestion, billing, and customer operations grow.

## Cons of splitting the admin too far
- Too many top-level items can make the app feel fragmented.
- Operators may lose context if every click jumps to a disconnected page.
- Overbuilding now could outpace the actual backend/admin functionality.

## Recommended admin page/view model

### Top-level views
1. **Overview**
   - purpose: operational summary and alert triage
   - include: KPI cards, active alerts, source health summary, recent failed/partial runs, runtime status
   - important: do **not** make this a dumping ground for every table in full
   - should answer: “What needs attention right now?”

2. **Customers**
   - purpose: operator view of accounts, plans, keys, current usage posture
   - include: customer list, status, plan, API key count, last activity, support flags
   - drill-down:
     - `Customers > Customer detail`
     - detail should show subscription state, keys, recent usage, account notes/events later

3. **Billing**
   - purpose: subscription and payment operations
   - include: plans loaded, checkout/webhook config state, customer subscription mismatches, payment failures/invoice issues later
   - drill-down:
     - `Billing > Customer billing detail`
     - `Billing > Webhook events` (later)

4. **Usage**
   - purpose: platform-wide traffic and quota behavior
   - include: request totals, endpoint mix, active keys, anomalies, maybe top accounts by usage
   - keep separate from Customers because operators will sometimes investigate traffic patterns independent of a specific customer

5. **Sources**
   - purpose: upstream/source registry health
   - include: source list, access method, license tag, status, freshness, record counts
   - drill-down:
     - `Sources > Source detail`
     - source detail should show latest run, licensing posture, cadence, checkpoints, known issues

6. **Ingestion Runs**
   - purpose: job history and pipeline debugging
   - include: run list, status, timings, records seen/written/failed, checkpoint, error state
   - drill-down:
     - `Ingestion Runs > Run detail`
   - this is one of the clearest candidates for a dedicated page because operators will inspect runs repeatedly

7. **Database**
   - purpose: storage and data-shape overview
   - include: table counts, seeded vs ingested mix, freshness, maybe growth/coverage later
   - keep this more compact unless true DB diagnostics become a real operational need

8. **System Status / Alerts**
   - purpose: service/runtime health and active warnings
   - include: health endpoint, degraded dependencies, queue/runtime warnings, alert list
   - could be one combined area for now, split later only if logs/alerting gets much deeper

### Optional later admin views
9. **Logs**
   - only create as a dedicated top-level view if live log/event browsing becomes a real daily operator job
   - otherwise keep logs embedded in alert/run/customer detail pages

10. **Configuration / Platform settings**
   - add only when there are meaningful editable operator controls
   - not worth promoting too early

## Suggested admin structure
- `/overview`
- `/customers`
- `/customers/:id`
- `/billing`
- `/billing/customers/:id` or billing in customer detail
- `/usage`
- `/sources`
- `/sources/:sourceCode`
- `/ingestion-runs`
- `/ingestion-runs/:id`
- `/database`
- `/system-status`

## Practical rule for admin
If an operator frequently needs to:
- filter/sort a list
- compare many rows
- inspect one entity in detail
- move from alert to root cause

…that domain deserves its own page and often its own detail route.

## Bottom line for admin
**Yes, split more.** The current admin sections are correct, but they should become true pages with drill-downs rather than one composite dashboard carrying everything.

---

## Comparison: dashboard vs admin split depth

| Surface | Recommended split depth | Why |
|---|---|---|
| Customer dashboard | Moderate | Users have a small set of repeat self-service tasks and want speed over exploration |
| Admin | Deeper | Operators investigate, triage, compare, and drill into failures across multiple domains |

In other words:
- **dashboard = compact product workspace**
- **admin = operational console**

They should not mirror each other.

---

## What not to do

## Don’t make the dashboard admin-like
Avoid adding:
- source health tables
- ingestion runs
- database stats
- internal diagnostics not directly actionable for customers

The current docs already point the right way here.

## Don’t keep admin too overview-heavy
Avoid leaving operators stuck in one giant landing page where every domain is partially visible but nothing is easy to investigate.

## Don’t overfit to current scaffolding
The current `App.tsx` files are useful shell prototypes, but they should not dictate the final IA just because they started as single-file apps.

---

## Practical implementation approach

## Phase 1: route the current sections cleanly
For both apps:
- introduce real routes for existing top-level sections
- preserve the current nav labels
- keep Overview as landing page

This gives immediate benefits without changing the IA dramatically.

## Phase 2: add detail routes only where the workflow clearly needs them
Start with:
- dashboard: `API Keys` and maybe `Billing`
- admin: `Customers`, `Sources`, `Ingestion Runs`

Those are the strongest candidates for drill-down.

## Phase 3: keep overview pages summary-only
Especially in admin:
- Overview should surface KPIs, warnings, and “go investigate here” links
- domain pages should hold the dense tables and deep context

That avoids the classic ops-dashboard problem where the home page becomes unusable.

---

## Final recommendation

### Customer dashboard
- **Split into real routed primary views now**
- keep the current 7-ish sections
- add only limited subviews where tasks become multi-step
- prefer a shallow structure

### Admin
- **Split further into a proper multi-view app now**
- keep Overview, but move dense operational work into dedicated pages
- add detail routes for customers, sources, and ingestion runs first
- expect admin to grow deeper than dashboard

## Best-fit model for this product
- **Dashboard:** simple self-service workspace
- **Admin:** investigation and operations console

That is the most practical fit for the current codebase, the documented surface boundaries, and the likely day-to-day behavior of customers versus operators.
