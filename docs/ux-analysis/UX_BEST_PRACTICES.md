# UX Best Practices for SaaS Dashboard + Admin Console

## Why this memo exists
This project already has the right high-level split:
- **Public site** for product story, docs, pricing, and safe demo
- **Customer dashboard** for API keys, usage, billing, and self-serve workflows
- **Admin/operator console** for internal monitoring, source health, ingestion runs, and support tasks

The UX risk now is not lack of features. It is **surface creep**:
- too much mixed into one page
- too many equal-weight cards
- dashboards pretending to be control panels
- admin screens trying to look “cool” instead of being fast to scan

This document focuses on practical guidance for:
- information hierarchy
- reducing clutter without hiding useful depth
- scanability in data-heavy products
- when to split into separate pages vs keep things in one shell
- how to make dense interfaces feel light, calm, and credible

---

## Useful reference points from research
A few external ideas are worth anchoring on:

- **NN/g on dashboards:** a dashboard should support quick understanding at a glance, not become a giant exploratory interface. If users must do substantial analysis, that usually belongs in deeper views, not the summary dashboard.
- **Progressive disclosure (IxDF):** show the essential layer first; keep advanced filters, edge-case settings, and secondary metadata available on demand.
- **Scanability research:** people scan far more than they read. That matters even more in B2B/admin tools where users are juggling tasks and often operating on partial attention.
- **Enterprise table design guidance:** tables are not the enemy. Bad tables are. For operational/admin software, a well-structured table is often more useful than a grid of decorative cards.
- **NN/g on dangerous/consequential actions:** destructive or high-risk actions must be visually and spatially separated from routine actions.

These points strongly support the product direction already documented in this repo.

---

## Core principle: each screen should answer one dominant question
The easiest way to reduce clutter is to stop designing screens that try to answer six questions at once.

For every page, define the main user question.

Examples for this project:
- **Customer overview:** “Is my account/API healthy right now?”
- **API keys:** “Which keys exist, what are they used for, and what should I do next?”
- **Usage:** “Am I near limits, and what is driving consumption?”
- **Billing:** “What plan am I on, what happens next, and is anything broken?”
- **Admin source health:** “Which data source or ingestion flow needs attention?”
- **Admin users/support:** “Which customer/account needs intervention?”

If a screen has no dominant question, it becomes a dumping ground.

---

## Information hierarchy rules that work well for this product

### 1. Put status before detail
On both dashboard and admin screens, the first layer should answer:
- is everything okay?
- what changed?
- what needs action?

That means the top of a page should usually contain:
1. **page title + one-sentence context**
2. **primary status band / summary strip**
3. **primary action(s)**
4. **main content area**
5. **secondary detail / history / explanatory content**

Do not start with long paragraphs or a wall of controls.

### 2. Do not give all cards equal visual weight
A common SaaS mistake is a dashboard full of identical cards. It looks tidy but kills hierarchy.

Use three levels:
- **Primary:** the one or two cards or panels that matter most right now
- **Secondary:** supporting metrics or recent activity
- **Tertiary:** reference info, footnotes, docs links, system notes

For this project, the most important card on customer overview is probably not “countries supported.” It is more likely:
- current plan
- request usage vs quota
- API health / latest activity
- key setup status

### 3. Separate “monitoring” from “management”
A lot of clutter comes from mixing read-only summary, live monitoring, and configuration forms in one page.

Use this split:
- **Overview page:** summary + recent changes + alerts
- **Management pages:** actual editing and setup
- **Detail pages/drawers:** logs, payloads, raw records, timelines

Example:
- Customer overview can show “2 API keys active”
- Actual key creation, rotation, labeling, and revocation should live on **API Keys**

### 4. Lead with exceptions, not totals
Totals are nice. Exceptions drive action.

Prefer:
- “1 key nearing quota” over “3 keys total”
- “UK ingest blocked” over “2 sources enabled”
- “3 failed webhooks today” over “124 webhook events processed”

That does not mean hiding totals. It means the UI should surface what needs human attention first.

---

## Scanability rules for data-heavy interfaces

### 1. Write labels like someone will only read 30% of them
Good labels are short, concrete, and non-overlapping.

Bad:
- Information
- Stats
- Activity
- Details

Better:
- Usage this month
- Active API keys
- Last successful ingest
- Failed runs
- Billing renewal date
- Search result sources

If two cards could swap titles and still make sense, the labels are too vague.

### 2. Use repeated layout grammar
Dense interfaces feel lighter when the user learns one pattern and reuses it.

Good repeated pattern for cards/panels:
- eyebrow / small label
- main value or object title
- one-line explanation or state
- 1–3 related actions
- optional footer/meta

Good repeated pattern for tables:
- strong first column
- meaningful secondary column
- status column
- last-updated column
- row actions at far right

Consistency lowers cognitive cost more than extra whitespace alone.

### 3. Prefer chunked vertical scanning over wide horizontal scanning
Users scan down faster than across.

Implications:
- keep card titles short
- avoid too many columns in default tables
- use expandable rows or detail drawers for long metadata
- group filters into a compact control bar rather than sprinkling them everywhere

### 4. Use typography hierarchy, not just color
To improve scanability in light UIs:
- page title: obvious
- section title: clear but smaller
- metric value: bold and high contrast
- helper text: muted
- metadata: smallest and quietest

If everything is medium gray text at nearly the same size, the UI feels polite but hard to read.

### 5. Design for interrupted attention
Admin users and operators often work while context-switching.

That means:
- timestamps should be visible
- statuses should be persistent and legible
- alerts should link directly to the affected entity/run/source
- actions should be explicit, not hidden behind clever microcopy

---

## Reducing clutter without losing capability

### Keep the default view narrow
Default screen content should reflect the most common task, not the longest list of possible features.

For this product:
- customer dashboard default should not expose every billing edge case, advanced filter, and debug block at once
- admin default should not dump raw logs, every system metric, and all source metadata above the fold

### Use progressive disclosure aggressively, but carefully
Good candidates for hidden/revealed content:
- advanced filters
- raw JSON payloads
- debug metadata
- secondary plan details
- historical comparisons
- full source/legal details
- dangerous actions

Bad candidates for hidden/revealed content:
- current status
- primary CTA
- active errors
- quota state
- whether a job failed

Hide complexity, not urgency.

### Collapse explanation once the workflow is learned
Early MVPs often include a lot of explanatory copy. That is fine at first, but it should gradually move into:
- tooltips
- info popovers
- docs links
- inline “Learn more” patterns

If every page has four paragraphs explaining itself, users stop reading all of them.

### Replace decorative cards with useful summaries
If a card doesn’t help decide, diagnose, or act, it is probably filler.

Examples of useful summary cards:
- Requests used / remaining
- Last successful request timestamp
- Active sources / degraded sources
- Failed ingestion runs in last 24h
- Current plan and renewal state

Examples of low-value filler cards:
- generic “Welcome back” message after first use
- vanity counts without next-step meaning
- duplicated status already visible elsewhere

---

## When to keep things in one shell vs split into separate pages
This is the most important IA decision for this project.

## Keep in one shell when:

### 1. The user is answering the same question with multiple supporting panels
Example:
- Customer **Overview** can include usage summary, plan status, key count, and recent requests because they all support the same question: “How is my account doing right now?”

### 2. Panels are summary-level and glanceable
If each block can be understood in a few seconds, the shell can hold more of them.

### 3. The data refresh cadence and action urgency are similar
Example:
- source health + latest run + failure count fit together
- source health + detailed legal licensing review probably do not

### 4. The user frequently cross-references the panels together
If people constantly compare quota, active keys, and recent usage, keeping them in one shell is good.

---

## Split into separate pages when any of these become true:

### 1. A section needs its own workflow
If a page includes create/edit/revoke/search/filter/export/history/retry, it is no longer a “section” — it is a product area.

Examples that deserve separate pages:
- API key management
- usage analytics/history
- billing and invoices
- source detail
- ingestion run detail
- user/account support detail

### 2. Users need different mental modes
A fast way to decide page boundaries:
- **Monitoring mode** = keep together
- **Editing/config mode** = separate
- **Investigation/debug mode** = separate

Example:
- Admin “Sources” page can show all sources and health
- Clicking a source should open a dedicated source detail page with config, history, and recent failures

### 3. The section requires dense tables or advanced filters
The moment you need:
- saved filters
- bulk actions
- many columns
- date-range analysis
- long result lists

you usually need a dedicated page, not another dashboard card.

### 4. The page starts fighting for above-the-fold space
A good smell test:
- if three blocks all claim top priority, none of them belongs on the same page

### 5. The user may want to bookmark or return directly to that area
Examples:
- `/dashboard/api-keys`
- `/dashboard/usage`
- `/admin/sources`
- `/admin/runs/:id`

If something matters enough to revisit directly, it deserves a stable route.

---

## Recommended structure for this project

## Customer dashboard

### Overview
Keep this as a **thin command summary**, not a mini-app.

Should include:
- plan + renewal state
- usage vs quota
- active API key count
- recent request health / latest activity
- docs/playground quick access
- 1–3 alerts or recommendations

Should not include in full:
- full API key table
- billing history table
- long request logs
- advanced search UI bigger than the rest of the page

### API Keys
Dedicated page.

Should include:
- key list table
- create / rotate / revoke actions
- labels, scopes, created date, last used, status
- copy snippet / environment variable guidance
- clear separation between routine and destructive actions

### Usage
Dedicated page.

Should include:
- current period usage
- trend view
- breakdown by key / endpoint / day if available
- quota warnings and plan implications
- filters if real data justifies them

### Billing
Dedicated page.

Should include:
- current plan
- renewal / subscription status
- payment state
- invoice/history area when real
- upgrade/downgrade actions

### Playground
Can live as a page inside dashboard, but should stay task-focused.

If it becomes a bigger request explorer with saved examples, response comparison, and logs, it may deserve a stronger “Developer Console” framing.

---

## Admin/operator console

### Admin overview
Should answer:
- what is broken?
- who needs help?
- which source/run is degraded?

Top level should include:
- source health summary
- failed/active ingestion runs
- customer-impacting incidents
- API error rate or service health
- recent operator-relevant events

Avoid turning overview into a giant all-data wall.

### Sources
Dedicated page.

Needs:
- table/list of sources
- status, cadence, last sync, next action
- filter by state/country
- clear drill-in to source detail

### Source detail
Dedicated page.

Needs:
- status banner
- last successful run
- last failed run
- recent history
- schema/source notes
- config/legal/ownership details in secondary panels

### Ingestion runs
Dedicated page.

Needs:
- table of runs with state, source, started/ended, records processed, failure reason
- good filters
- drill-in to run detail

### Run detail
Dedicated page or drawer.

Needs:
- summary at top
- timeline/events
- logs/raw payload links if available
- retry / inspect actions if supported

### Users / support
Dedicated page.

Needs:
- customer/account table
- plan, status, request volume, support flags
- drill-in to customer detail

### Billing / API activity / logs
Separate pages if they exceed summary depth.
Do not stuff them under one generic “System” page unless the data volume is tiny.

---

## How to make a data-heavy UI feel light and airy without becoming empty
“Light and airy” does **not** mean oversized cards and huge whitespace everywhere. In admin/data products, that often makes the interface slower and more childish.

The better version is:
- clear hierarchy
- quiet backgrounds
- restrained borders
- fewer competing colors
- enough breathing room around groups
- dense content inside calm containers

### Practical styling rules

#### 1. Use whitespace between groups, not inside every row
Good:
- generous spacing between sections/cards
- tighter spacing inside tables and repeated lists

This keeps the page calm without destroying density.

#### 2. Use soft surfaces, but keep core data surfaces crisp
For this project’s Nordic/light direction:
- page background can be soft or tinted
- hero/header surfaces can use subtle gradients or glass
- operational cards/tables should stay mostly solid and readable

Glass everywhere will make data blur together.

#### 3. Limit accents to meaning
Use color mostly for:
- primary CTA
- status/severity
- selected nav state
- key chart emphasis

If every badge, icon, and metric gets its own bright color, the interface stops feeling calm.

#### 4. Reserve shadows for elevation, not decoration
Too many floating cards make dense screens feel busy.
Prefer:
- subtle border
- minimal shadow
- stronger contrast only on active/focused elements

#### 5. Let one object own the row
In tables and result cards, make one element clearly primary:
- company name
- source name
- run ID
- API key label
- user/account identifier

Everything else should visually support that object.

---

## Cards vs tables vs drawers: what to use where

### Use cards for:
- summary metrics
- alerts
- object previews
- onboarding/recommendation blocks
- small result sets

### Use tables for:
- comparable records
- operational review
- logs/runs/users/keys/invoices
- anything with sorting/filtering and repeated row patterns

### Use drawers or side panels for:
- quick detail without losing list context
- row inspection
- raw JSON / metadata / timeline detail

### Use dedicated pages for:
- full workflows
- complex investigation
- any area with multiple states, filters, and sub-actions

For this project, a strong pattern would be:
- **table/list first** for admin entities
- **drawer or detail page** for investigation
- **summary cards** only at the overview level

---

## Good default page formula
A reliable structure for both dashboard and admin pages:

1. **Header**
   - title
   - one-line context
   - primary action

2. **Status / KPI strip**
   - 3 to 5 meaningful summaries max

3. **Main working area**
   - one dominant panel or table

4. **Secondary panels**
   - recent activity
   - explanation
   - linked entities
   - docs/help

5. **Advanced detail**
   - hidden behind tabs, drawers, accordions, or separate routes

If a page deviates from this, it should be for a clear reason.

---

## Specific anti-patterns to avoid in this project

### 1. Public-site habits leaking into admin screens
Admin should not be full of oversized marketing-style cards, decorative gradients, and long persuasion copy.

### 2. Dashboard becoming a second admin console
Customers do not need internal source-health detail everywhere. Keep customer-facing language outcome-oriented.

### 3. Admin overview trying to show every object type at once
If overview contains users, billing, logs, runs, sources, queues, webhooks, and infrastructure in equal depth, scanability collapses.

### 4. Hiding key status inside tabs
Critical status should be visible immediately, not buried in tab 3.

### 5. Using modals for large management tasks
Use modals for lightweight actions. Use pages for full workflows.

### 6. Overusing badges
Badges are useful for status. They are not a substitute for hierarchy.

### 7. Mixing summary metrics with raw debug data above the fold
This is one of the fastest ways to make a product feel cluttered.

---

## Recommended UX decisions for the current MVP

## Near-term public/dashboard/admin direction

### Public site
- Keep it **single-flow and lightweight**
- Maintain one core narrative: trust -> product value -> coverage -> pricing -> live demo -> docs
- Do not mix internal project/admin concepts into the main public IA

### Customer dashboard
- Keep **Overview** intentionally small and reassuring
- Move operational detail into dedicated routes early
- Treat API keys and usage as first-class pages, not expandable subcards forever
- Keep docs and playground close at hand because this is an API product

### Admin
- Use denser layouts than dashboard, but keep them calm
- Prefer tables + status banners + detail drawers over card mosaics
- Prioritize source health, ingestion runs, and customer-impacting issues over vanity metrics
- Keep destructive actions isolated and explicit

---

## A simple page-splitting checklist
Before adding a new section to an existing page, ask:

1. Does this support the same main question as the rest of the page?
2. Can a user understand it in under 5 seconds?
3. Does it need advanced filters, bulk actions, or full editing?
4. Will users want to return directly to it later?
5. Does it introduce a different mental mode: monitor, edit, or investigate?

If answers are mostly **no / yes / yes / yes / yes**, it should probably be its own page.

---

## Suggested implementation priorities for this repo

### Priority 1: tighten customer overview hierarchy
- reduce equal-weight cards
- surface usage/quota/status first
- keep only short recent activity / next steps on overview

### Priority 2: strengthen table-first patterns in admin
- sources table
- ingestion runs table
- user/customer table
- consistent row hierarchy and right-aligned actions

### Priority 3: add drill-in patterns early
- source detail pages
- run detail pages
- API key detail/drawer
- usage breakdown views

### Priority 4: standardize status language
Use one shared vocabulary across surfaces:
- healthy
- degraded
- failed
- pending
- paused
- trialing
- active
- nearing quota
- over quota

Inconsistent status naming creates hidden clutter.

### Priority 5: simplify copy everywhere
Replace generic labels and long explanatory blocks with:
- precise headings
- one-line helper text
- docs links for depth

---

## Bottom line
The right move for this product is **not** to cram more into the overview screens.

The right move is:
- keep overviews thin, clear, and action-oriented
- move real workflows onto dedicated pages
- use tables for repeated operational records
- use cards for summary only
- reveal advanced detail progressively
- create calmness through hierarchy and consistency, not emptiness

If this principle is followed, the product can stay both:
- **airy and credible for customers**, and
- **dense and efficient for operators**

without either surface collapsing into clutter.
