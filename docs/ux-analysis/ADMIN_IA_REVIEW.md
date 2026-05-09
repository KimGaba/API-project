# Admin IA Review (`apps/admin`)

## Scope and method

This review looks at the current admin surface in `apps/admin` from an information architecture and operator UX perspective, using the existing local implementation as the primary source.

Primary materials reviewed:
- `apps/admin/src/App.tsx`
- `apps/admin/src/styles.css`
- `apps/admin/README.md`

## Current state at a glance

The current admin is effectively a **single-screen operator dashboard with sidebar filtering**, not a truly multi-page admin product.

Evidence from the implementation:
- All major sections live in one `App.tsx` file.
- Navigation is controlled by a single `active` state (`overview`, `customers`, `billing`, `platform-usage`, `sources`, `ingestion-runs`, `database`, `system-status`).
- The `overview` state renders **nearly everything at once** by setting `visibleSections` to all other sections.
- Even when a section is selected, the page still keeps the same overall layout and card language rather than shifting into a dedicated task mode.

That means the product currently behaves more like a **dense status cockpit** than an admin app with clear levels of detail.

## What is working well

### 1. The domain model is already sensible
The section list itself is pretty reasonable:
- Overview
- Customers
- Billing
- Platform usage
- Integrations / sources
- Ingestion runs
- Database
- System & alerts

This is a believable split between business operations and platform operations.

### 2. The UI is already trying to stay explicit
There is good operator honesty in the copy and states:
- fallback mode is surfaced clearly
- data availability is explicit
- warnings are promoted into alerts
- runtime health is separated from business metrics

That is exactly the right instinct for an internal ops tool.

### 3. Visual styling aims for calm rather than “enterprise grimness”
The lighter palette, rounded containers, and generous card styling are a good base. The app is not visually harsh.

## Core IA problem

The main issue is **not that there are too many sections**. The main issue is that the app mixes **overview, monitoring, investigation, and management** into one level.

Right now the operator experience has these problems:

1. **Overview is too comprehensive**  
   It shows KPI cards, customers, integrations, runs, billing, alerts, health, database, notes, and runtime summary all on one screen.

2. **Top-level nav includes both destinations and content slices**  
   For example, `System & alerts` is partly an alert inbox, partly health status; `Platform usage` is really a supporting metric slice; `Database` is a diagnostic drill-down. These do not all deserve equal prominence.

3. **Selected nav item does not create a meaningfully different working context**  
   The operator gets a highlighted panel, but not a dedicated page structure for that job.

4. **The screen is scan-heavy but not decision-first**  
   There is a lot to read before knowing what matters now.

5. **The app is airy at the component level, but dense at the information level**  
   The cards have padding, but there are still too many parallel panels competing for attention.

## Recommended IA direction

The admin should become a **two-level structure**:

- **Level 1: a small number of top-level operator destinations**
- **Level 2: dedicated pages/subviews for investigation and detail**

### Recommended top-level navigation

I would reduce the primary nav to:

1. **Overview**
2. **Customers**
3. **Billing**
4. **Data pipelines**
5. **System health**

This is cleaner than the current 8-item split and maps better to operator intent.

### Where current sections should move

#### Keep top-level
- **Overview**
- **Customers**
- **Billing**

These are primary operator jobs and deserve top-level entry.

#### Merge into “Data pipelines”
Current:
- `sources`
- `ingestion-runs`
- `database`
- parts of `platform-usage`

Reason:
These are all parts of the same mental model: **how data gets in, what happened during processing, and what ended up in storage**.

Suggested subviews under Data pipelines:
- **Sources** — registry/source health, freshness, licensing, access mode
- **Runs** — recent and failed ingestion runs, retry needs, checkpoints
- **Storage** — database counts, freshness, seeded vs ingested mix
- **Traffic / usage signals** — only if this is truly operator-relevant for ingestion and platform load

#### Merge into “System health”
Current:
- `system-status`
- alerts portion from overview
- runtime summary / notes

Suggested subviews under System health:
- **Alerts** — triage list first
- **Services** — API, workers, billing wiring, admin status
- **Events / notes** — recent platform/operator notes

### Make “Platform usage” conditional, not primary
`Platform usage` does not feel strong enough as a standalone top-level page yet.

Why:
- It is currently partially fallback-backed.
- It acts more like a supporting metric slice than a primary operator workflow.
- It overlaps conceptually with both customer success/commercial monitoring and technical capacity/load monitoring.

Recommendation:
- Move it under **Overview** as summary metrics
- and/or under **Customers** (customer consumption)
- and/or under **System health** (platform load)

Do **not** keep it as a primary nav item unless it grows into a real analysis tool.

## What the Overview page should become

The current overview is trying to do too much. It should become a **triage hub**, not a long report.

### Overview should answer only 4 questions
1. What needs attention now?
2. Are customers affected?
3. Are pipelines healthy?
4. Is the system basically up?

### Recommended overview structure

#### Row 1: Actionable summary
- **Open alerts**
- **Failed / partial runs**
- **Customers at risk / watch state**
- **Freshness / last successful ingest**

These are better than broad vanity KPIs because they help an operator decide where to go next.

#### Row 2: Short health snapshots
Two or three compact cards only:
- Customer/commercial snapshot
- Pipeline snapshot
- Runtime snapshot

Each card should end with a clear link like:
- “View customers”
- “Open failed runs”
- “Review system alerts”

#### Row 3: Recent important events
A single concise feed:
- latest failure
- latest recovery
- billing config gap
- fallback mode activation

This is better than multiple small “notes” and “runtime summary” panels.

### What should leave Overview
Remove full tables/lists for:
- customer table
- integrations table
- ingestion runs table
- billing list
- database detail list
- full system health list

Overview should tease, not fully contain.

## Page-by-page recommendations

## 1) Customers

### Current state
The current customers section is a table embedded into the shared dashboard layout. It shows:
- customer identity
- plan
- usage
- health/watch state
- note with key count, country, last-used timestamp

### Recommendation
Keep Customers top-level, but make it a **real workspace page**.

### Suggested structure
- Header with counts and filters
- Customer table as the primary canvas
- Drill-down row/page for a single customer

### What should be top-level on this page
- Active vs watch accounts
- plan
- current period usage
- API key posture
- last activity

### What should be drill-down
- per-customer subscription details
- usage trend detail
- API key history
- country or operational metadata

### UX improvement
The current `note` field crams multiple secondary facts into one line. Good for prototyping, not ideal for scanning. Break this into columns or secondary chips.

## 2) Billing

### Current state
Billing is rendered as a list of accounts/plans/issues/actions. It is readable but feels mixed between:
- plan catalog
- customer subscription status
- billing configuration readiness

### Recommendation
Split Billing into two subviews:
- **Subscriptions**
- **Configuration**

### Top-level content
Subscriptions:
- customers with missing or unusual subscription state
- plan coverage
- quota/rate posture

Configuration:
- checkout configured?
- webhook configured?
- mode (test/live)
- known billing wiring gaps

### Why
Operators should not have to parse plan catalog data and system configuration status in one visual block.

## 3) Data pipelines

This is where the biggest structural improvement lies.

### Current state
The app currently separates:
- Integrations
- Ingestion runs
- Database

But operators likely experience these as one chain:
**source -> run -> stored data -> freshness / completeness**

### Recommendation
Create a single top-level **Data pipelines** section with tabs/subnav:
- Sources
- Runs
- Storage

### Sources subview
Show:
- source name / country
- access method
- license tag
- active/degraded state
- last successful freshness
- record volume

Ideal drill-down:
- latest run details for this source
- recent failures
- licensing caveats
- sync cadence

### Runs subview
This should be the primary operational troubleshooting page.

Promote to top of page:
- failed runs
- partial runs
- running runs
- retries needed

Then show the full recent runs table.

Ideal drill-down:
- full run log
- checkpoint
- error message
- seen/written/failed records
- duration

### Storage subview
This should be quieter and more diagnostic.

Show:
- company counts
- ingested vs seeded
- related rows
- latest source-backed update

This does **not** need equal prominence with failed runs. It is supporting evidence, not the main task surface.

## 4) System health

### Current state
System health is currently split across:
- Alerts panel
- System health panel
- Runtime summary
- Operator notes

### Recommendation
Turn this into a clearer hierarchy:

#### First: Alerts inbox
This should be the hero area.
- warnings requiring action
- advisory items second
- clear severity ordering

#### Second: Service health
- API
- admin app
- admin overview
- billing plans
- ingestion worker

#### Third: Recent events
Merge operator notes and runtime summary into one event stream.

### Why
Right now “Alerts”, “System health”, “Operator notes”, and “Runtime summary” all compete as peers, which weakens scanability.

## What should be top-level vs drill-down

## Top-level should contain
Only the things an operator checks frequently or uses to decide the next action:
- alert counts and severe alerts
- failed / partial pipeline runs
- customer accounts needing attention
- billing wiring gaps
- latest successful freshness
- essential service status

## Drill-down should contain
Anything diagnostic, historical, or object-specific:
- full customer operational detail
- per-source run history
- full run checkpoint/error details
- detailed DB composition
- configuration metadata and explanatory notes
- verbose fallback reasoning

A good rule here:
**if it explains a row, it probably belongs in drill-down rather than the top-level surface.**

## How to make the UI feel more airy and easier to scan

The visual styling is already fairly soft; the real gain comes from reducing simultaneous information density.

### 1. Stop showing every major module on Overview
This is the single biggest improvement.

### 2. Use fewer, stronger cards
Instead of many peer panels, use:
- 3–4 summary cards
- 1 alerts block
- 1 recent events block

### 3. Promote exceptions over totals
For operators, these are more useful than generic counts:
- failed runs
- stale sources
- customers in watch state
- config gaps

Totals can remain as secondary context.

### 4. Reduce long explanatory copy in headers
The current page descriptions are thoughtful, but many are too verbose for repeated admin use. Keep the honesty, shorten the copy.

### 5. Convert “note soup” into structured metadata
Places like customer notes and runtime summaries currently compress multiple facts into prose. That hurts scan speed.

Prefer:
- chips
- 2–3 concise metadata columns
- short labeled sub-rows

### 6. Give each page one dominant object type
Examples:
- Customers page -> customer rows
- Runs page -> run rows
- Sources page -> source rows
- Alerts page -> alert rows

This makes the UI feel calmer immediately.

### 7. Use progressive disclosure for diagnostics
Hide lower-priority details behind:
- row expansion
- side panel / drawer
- dedicated detail page

Do not surface all operational detail by default.

## Specific issues visible in the current implementation

### Overview is structurally overloaded
`visibleSections` for `overview` expands to almost every other section. This guarantees a crowded home state.

### Navigation granularity is inconsistent
- `Customers` and `Billing` are workflow areas
- `Database` is a diagnostic subsystem
- `Platform usage` is a cross-cutting metric category
- `System & alerts` combines multiple concerns

These are not all the same level of abstraction.

### Sidebar likely feels heavier than necessary
The sidebar contains:
- brand block
- two control buttons
- 8 nav items
- runtime card

That is not terrible, but once the main surface is also dense, it becomes a lot of parallel framing. Reducing top-level destinations to ~5 would help.

### The app currently uses “focus panel” rather than page transformation
This is efficient to build, but not ideal for operator cognition. Dedicated routes/views would better signal context changes.

## Suggested target IA

## Primary nav
- Overview
- Customers
- Billing
- Data pipelines
- System health

## Secondary nav / tabs
### Customers
- All customers
- Watchlist
- Usage

### Billing
- Subscriptions
- Plans
- Configuration

### Data pipelines
- Sources
- Runs
- Storage

### System health
- Alerts
- Services
- Events

## Routing implication
The current state-based section toggling can evolve into route-based views, for example:
- `/admin`
- `/admin/customers`
- `/admin/billing`
- `/admin/pipelines/sources`
- `/admin/pipelines/runs`
- `/admin/pipelines/storage`
- `/admin/system/alerts`
- `/admin/system/services`

That would support cleaner deep links and more focused page layouts.

## Priority recommendations

### Highest priority
1. **Redesign Overview as a triage page instead of a mega-dashboard.**
2. **Merge Sources + Ingestion Runs + Database into a single Data pipelines area.**
3. **Turn System & alerts into a clearer alert-first system health section.**

### Medium priority
4. Reduce primary nav from 8 items to ~5.
5. Move Platform usage out of primary nav unless it becomes a stronger standalone workflow.
6. Replace prose-heavy metadata rows with structured columns/chips.

### Lower priority
7. Introduce route-based pages and drill-down views.
8. Add row expansion/detail drawers for customers, sources, and runs.
9. Further trim header copy for repeat operator use.

## Bottom line

The admin does **not** need more top-level sections. It needs **fewer, clearer levels**.

Right now it is a well-intentioned but overpacked control surface. The biggest win would be to:
- make **Overview** a triage page,
- group pipeline-related concerns into one **Data pipelines** area,
- and let detailed tables live on dedicated views rather than all appearing on the home screen.

That would make the admin feel more airy, more trustworthy, and faster for operators to scan under pressure.
