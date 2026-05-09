# Screenshot ↔ Source Mapping

## Scope and limitation

This analysis was requested for:
- provided screenshots / reference images
- imported source in `design-import/`
- current implementation in `apps/project`, `apps/dashboard`, and `apps/admin`

### Important limitation
No screenshot/reference image files were present inside the repository at the time of analysis. A filesystem search outside `node_modules` found no PNG/JPG/WebP/GIF/SVG/PDF design assets in `company-data-project/` itself.

Because of that, this document treats the imported design source in `design-import/` as the strongest available proxy for the screenshots, and compares that source against the current implementation. If the original screenshots exist outside the repo or were provided only in chat, they should be rechecked against this document, but the one-to-one mapping below is already quite clear.

---

## Executive mapping

The imported design source strongly suggests **three distinct reference screenshots/surfaces**:

1. **Marketing / public landing page screenshot**
   - maps to `design-import/LandingPage.tsx`
   - current related implementation: `apps/project/src/App.tsx` is **not** this surface; the actual public/product site is a separate app/site outside this direct mapping

2. **Customer dashboard screenshot**
   - maps to `design-import/UserDashboard.tsx`
   - current related implementation: `apps/dashboard/src/App.tsx`

3. **Admin / operations panel screenshot**
   - maps to `design-import/AdminPanel.tsx`
   - current related implementation: `apps/admin/src/App.tsx`

This is a very strong match because each imported file represents a fully formed visual surface with its own information architecture, styling system, and interaction model.

---

## Mapping detail by likely screenshot

## 1) Public marketing / landing screenshot

### Source component match
- **Imported source:** `design-import/LandingPage.tsx`
- **Shared styles:** `design-import/_group.css`

### Why this is the match
The component is a classic product-marketing homepage with:
- sticky top nav
- hero headline + CTA cluster
- trust/logo strip
- API playground/code block section
- features grid
- coverage section
- pricing cards
- compliance / trust area
- footer

That is unmistakably a public SaaS landing page rather than an authenticated product surface.

### What the screenshot likely confirms about layout / hierarchy
Treating the imported component as visual truth, the screenshot would confirm:
- **Hero-first hierarchy**: oversized headline, short value prop, two primary CTAs
- **Premium API-product tone**: clean white + muted gray palette with one strong blue accent
- **Marketing before tooling**: product story comes first, then API playground, then features/pricing
- **Wide-page section rhythm**: large vertical spacing and clear sectional separation
- **Developer trust cues**: code sample window, metrics, infrastructure claims, compliance badges
- **High polish / low clutter**: few competing colors, rounded controls, restrained cards

### Screenshot vs source notes
What the imported source says visually:
- uses `Plus Jakarta Sans` + `JetBrains Mono`
- uses a light nordic/product look, not a dense enterprise dashboard look
- includes image placeholders:
  - `/__mockup/images/hero-bg.png`
  - `/__mockup/images/europe-map.png`

Potential screenshot/source differences to watch:
- if the screenshot had richer imagery, gradients, or logos, the source may only approximate them
- if the screenshot showed exact spacing or different copy, the structure still matches even if content is placeholder-ish
- if the screenshot showed a specific product name or brand lockup, current source may be genericized as `CompanyData`

### Compared with current implementation
- `apps/project/src/App.tsx` is **not** the landing page equivalent
- it is an internal project board surface, with kanban/planning UI and “Surface 4” framing
- therefore:
  - **imported landing page is not yet represented by the current `apps/project` surface**
  - the screenshot/design source and current app differ at the product-architecture level, not just styling

### Bottom line
**Likely screenshot → `design-import/LandingPage.tsx`**

---

## 2) Customer dashboard screenshot

### Source component match
- **Imported source:** `design-import/UserDashboard.tsx`
- **Current implementation counterpart:** `apps/dashboard/src/App.tsx`

### Why this is the match
`UserDashboard.tsx` is clearly an authenticated customer workspace with:
- left sidebar navigation
- overview/API keys/usage/playground/billing/settings sections
- account chip/avatar in sidebar footer
- top header with operational status pill
- card-based content area

This is exactly the shape expected from a customer dashboard screenshot.

### What the screenshot likely confirms about layout / hierarchy
The design source confirms these visual truths:
- **Permanent left rail** for navigation
- **Single-primary-content model**: one active section shown in main pane
- **Overview page prioritizes business health** before deeper tools
- **Strong card hierarchy**: metrics cards first, then logs/tables/forms
- **Light SaaS dashboard aesthetic**: soft gray background, white cards, subtle borders/shadows
- **Customer self-serve emphasis**: API keys, usage, billing, playground, settings are first-class

### Distinct visual cues that make the match strong
- sidebar items: Overview, API Keys, Usage, Playground, Billing, Settings
- top-right API health pill
- API keys table with copy/revoke actions
- usage charts and endpoint breakdown
- billing summary with history table
- search playground with result card + JSON response split view

### Screenshot vs source notes
Potential differences if checked against actual screenshot:
- fonts in source use inline `DM Sans` import; screenshot may have same or near-equivalent font
- some charts are mocked with simple bars rather than production-grade charting
- some content values are fake/demo data
- playground results animate and are tab-driven only in source; screenshot may show only one state

### Compared with current implementation
`apps/dashboard/src/App.tsx` is clearly inspired by the same surface but differs materially:

#### What matches the imported design
- same **customer-dashboard role**
- left navigation + top content layout
- overview, keys, usage, billing, docs/search/account areas
- light default theme with optional dark mode
- card-based organization
- explicit separation from public site and admin app

#### Where current implementation differs from screenshot/source
- current app is **simpler and more textual**, less pixel-dense and less premium than the imported design
- nav labels differ:
  - imported: `Overview`, `API Keys`, `Usage`, `Playground`, `Billing`, `Settings`
  - current: `Overview`, `API Keys`, `Usage`, `Billing`, `Docs`, `Search`, `Account Settings`
- imported design uses richer tables and polished data cards; current app uses more generic info panels
- imported design’s playground is visually stronger, with a two-column company-details + JSON result layout
- imported design includes a more realistic account footer and cleaner status/header treatment
- current implementation is more MVP-documentation-oriented; imported design is more productized

### Bottom line
**Likely screenshot → `design-import/UserDashboard.tsx`**

This is also the clearest imported-to-current lineage in the repo.

---

## 3) Admin / operations screenshot

### Source component match
- **Imported source:** `design-import/AdminPanel.tsx`
- **Shared styles:** `design-import/_admin-panel.css`
- **Current implementation counterpart:** `apps/admin/src/App.tsx`

### Why this is the match
`AdminPanel.tsx` is unmistakably an internal operations console with:
- dark theme by default
- operator-style sidebar groups (`Dashboards`, `Infrastructure`, `Settings`)
- KPI strip across top
- customer overview table
- data sources table
- ingestion runs table
- system health panel
- live logs panel
- recent transactions panel

That is a direct match for an ops/admin screenshot, not a public or customer UI.

### What the screenshot likely confirms about layout / hierarchy
The design source confirms:
- **dark mission-control visual language**
- **dense information layout** with 12-column dashboard grid
- **KPIs first**, then customer + pipeline + infra detail
- **operator triage orientation**: status badges, logs, ingestion, source health, billing all visible together
- **table-heavy content** appropriate for internal tooling
- **single-screen situational awareness** rather than deep form workflows

### Distinct visual cues that make the match strong
- “CompanyData Ops” sidebar branding
- dark GitHub-like palette from `_admin-panel.css`
- top KPI cards for MRR, API calls, active customers, total records
- “Customer Overview” table
- “Data Sources & Integrations” and “Recent Ingestion Runs” tables
- “System Health”, “Live Logs”, and “Recent Transactions” stacked right column

### Screenshot vs source notes
Potential screenshot/source differences to verify later:
- screenshot may show slightly different copy, record counts, or alert states
- source uses realistic but mocked operational data
- screenshot may contain more exact spacing/typography refinements than the React import

### Compared with current implementation
`apps/admin/src/App.tsx` is related in intent but **not visually identical**:

#### What matches the imported design
- same core surface role: internal operator/admin app
- same separation from public site and customer dashboard
- same concern set: users, billing, API usage, sources, ingestion runs, database, system status
- local API integration with fallback embedded data

#### Where current implementation differs from screenshot/source
- current app defaults to a **light nordic theme**, while imported admin is **dark by default**
- current app is more **section-card narrative UI** than dense mission-control dashboard
- imported design is more operationally compressed and table-centric
- current app distributes sections as individually focusable cards; imported design shows many things simultaneously
- current app includes explicit “surface handoff” messaging and product-architecture education that the imported design does not need
- imported design’s visual hierarchy is more suitable for live monitoring; current app feels more like an internal product shell

### Bottom line
**Likely screenshot → `design-import/AdminPanel.tsx`**

---

## Cross-surface visual truths confirmed by the imported designs

Across all three imported surfaces, the screenshots/source appear to confirm:

- **Three-surface product model is intentional**
  - public marketing/product site
  - signed-in customer dashboard
  - internal admin/ops console

- **Each surface has its own visual language**
  - landing: airy, marketing-led, blue-accent, premium
  - customer dashboard: light, calm, self-serve SaaS
  - admin: dense, dark, operational, monitoring-oriented

- **Information architecture matters as much as styling**
  - these are not just different skins on one app
  - they are different jobs with different hierarchy needs

- **Imported designs are more visually opinionated than the current MVP apps**
  - especially dashboard and admin
  - current apps preserve surface boundaries, but not the full design fidelity

---

## Best-effort screenshot-to-current-source matrix

| Likely screenshot | Imported source match | Current app counterpart | Match quality | Main divergence |
|---|---|---|---|---|
| Public landing / marketing | `design-import/LandingPage.tsx` | no direct equivalent in `apps/project`; current `apps/project` is an internal board | Strong imported match, weak current-app match | Current `apps/project` serves a different purpose entirely |
| Customer dashboard | `design-import/UserDashboard.tsx` | `apps/dashboard/src/App.tsx` | Strong | Current dashboard is simpler, more MVP/text-heavy, less polished visually |
| Admin / ops panel | `design-import/AdminPanel.tsx` | `apps/admin/src/App.tsx` | Strong | Current admin is lighter, more narrative, less dense than imported mission-control layout |

---

## Recommended interpretation for implementation work

If screenshots are treated as visual truth, then the repo should use the imported files this way:

### Use as primary visual reference
- `design-import/LandingPage.tsx` for public/product surface direction
- `design-import/UserDashboard.tsx` for customer dashboard direction
- `design-import/AdminPanel.tsx` for admin/ops direction

### Use current apps as product/technical baseline
- `apps/dashboard/src/App.tsx` and `apps/admin/src/App.tsx` already encode useful product boundaries and local API wiring
- but they should be considered **adaptations**, not exact realizations of the imported designs

### Highest-confidence differences to reconcile later
1. **Admin theme + density mismatch**
   - screenshot/source strongly implies dark mission control
   - current implementation is lighter and more explanatory

2. **Dashboard fidelity gap**
   - current dashboard has correct sections but weaker visual structure than imported design

3. **Public surface mismatch in app structure**
   - imported landing page exists conceptually, but `apps/project` is a separate internal board, not the public site equivalent

---

## Final conclusion

Even without the actual screenshot files inside the repo, the mapping is highly likely to be:

- **Landing/public screenshot** → `design-import/LandingPage.tsx`
- **Customer dashboard screenshot** → `design-import/UserDashboard.tsx`
- **Admin/ops screenshot** → `design-import/AdminPanel.tsx`

The imported designs confirm a deliberate three-surface model with distinct layout priorities and visual languages. Compared with those references, the current `apps/dashboard` and `apps/admin` implementations are directionally correct but lower-fidelity and more MVP/pragmatic. The public landing design is the least directly represented in the current app set because `apps/project` is an internal board, not a marketing surface.
