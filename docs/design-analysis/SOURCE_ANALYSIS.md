# Source Design Analysis

## Scope
Analyzed:
- `design-import/LandingPage.tsx`
- `design-import/UserDashboard.tsx`
- `design-import/AdminPanel.tsx`
- `design-import/_group.css`
- `design-import/_admin-panel.css`

This analysis treats the imported files as **design-source references**, not production-ready app code.

---

## 1. Overall design direction

The imported source establishes a coherent SaaS/API product language across three surfaces:
- **Landing page:** polished, trust-heavy, conversion-oriented marketing site
- **User dashboard:** calm, light, data/product workspace for customers
- **Admin panel:** denser, operational control surface for internal use

Shared traits:
- strong typography and spacing discipline
- card/grid-based information layout
- icon-led section headers and status cues
- rounded corners, soft borders, restrained shadows
- Nordic/B2B styling: clean, quiet, institutional rather than playful
- product narrative centered on **company data API**, **coverage**, **trust**, **status**, and **developer usability**

Important caveat versus current project docs:
- the imported **admin panel is dark-first**, while current `docs/APP_STRUCTURE.md` says admin should be **light-mode default**.
- so the admin source is best treated as a **layout and information-architecture reference**, not a literal theme to copy 1:1.

---

## 2. LandingPage.tsx analysis

### High-level structure
The landing page is a classic product-marketing funnel with strong section sequencing:
1. **Sticky top navigation**
2. **Hero section** with headline, proof points, primary/secondary CTA
3. **Trust/logo strip**
4. **API playground / code showcase**
5. **Feature grid**
6. **Coverage section**
7. **Pricing cards**
8. **Trust/certifications row**
9. **Final CTA**
10. **Footer**

### Section hierarchy details
- **Nav:** compact, sticky, glass effect, anchors to product/coverage/pricing/docs
- **Hero:** big editorial headline, concise product framing, dual CTA, metrics row
- **Trust signals:** lightweight customer/logo band
- **Playground block:** split layout with narrative on left, interactive request/response code panel on right
- **Features:** 6-card modular capabilities grid
- **Coverage:** copy + progress bars + regional framing + map imagery
- **Pricing:** 3-tier comparison with one emphasized middle plan
- **Compliance/trust:** GDPR / ISO / SOC style signals
- **Final CTA / footer:** closes conversion loop and restores product/legal nav

### Reusable UI patterns from landing
- sticky top nav shell
- hero + metrics row
- section intro pattern: `title + supporting paragraph + content grid`
- icon cards for product capabilities
- code/request-response panel with tabs
- pricing-card trio with featured middle option
- trust/certification row
- repeated rounded-full CTA buttons

### Styling direction
From `_group.css` + usage:
- **Fonts:** Plus Jakarta Sans + JetBrains Mono
- **Palette:** neutral blue-gray brand scale with one strong blue accent
- **Mood:** airy, enterprise, precise
- **Effects:** soft gradients, translucent glass nav, code panel contrast, minimal border-based separation

### What translates realistically to current project surfaces
**Directly reusable now:**
- section ordering and copy framing for `site/`
- hero metrics, trust band, feature cards, pricing structure, CTA hierarchy
- developer-focused code showcase/playground framing
- brand token direction: blue-gray neutrals + single blue accent + mono for code/data

**Needs adaptation:**
- anchor-based single-page nav should map to actual current docs/demo routes
- pricing and coverage claims should be aligned with real MVP scope (Norway/UK/etc.), not the fictional 32-country mature product state in the mock
- imported image assets (`hero-bg.png`, `europe-map.png`) are placeholders unless equivalents exist

**Should not be copied literally yet:**
- enterprise-scale trust claims (`40M+`, `99.99%`, broad EU coverage) if not substantiated by current product state
- any exact product messaging that overstates live API maturity

---

## 3. UserDashboard.tsx analysis

### High-level structure
The dashboard is organized as a conventional customer product shell:
- **left sidebar navigation**
- **top header/status row**
- **main content area with tab-switched pages**

Tabs included:
- Overview
- API Keys
- Usage
- Playground
- Billing
- Settings

This aligns very closely with `docs/APP_STRUCTURE.md` for the user area.

### Internal page structure
#### Overview
- 3 KPI cards
- recent activity/log table

#### API Keys
- management header + primary action
- table of keys with hover actions
- security guidance callout

#### Usage
- simple chart area
- endpoint breakdown
- error-rate health card

#### Billing
- current plan card
- usage/progress within plan
- billing history table

#### Playground
- inline search/test form
- quick examples
- result summary + JSON payload panel

#### Settings
- profile/account form
- security actions

### Reusable UI patterns from dashboard
- persistent app shell with sidebar + content panel
- metric cards with tiny status icon/top-right indicator
- table/list cards with soft hover states
- inline callout/information boxes
- search form + result split panel
- badge system for state (`Active`, `200 OK`, tier tags)
- progress bars for usage/quota
- monospace blocks for keys, endpoints, and JSON

### Styling direction
- **Light mode default** with off-white backgrounds and white cards
- **DM Sans** font in component-local style import
- soft gray borders (`#e5e7eb` family)
- dark navy used sparingly for primary nav/buttons
- subtle depth via low-intensity shadows
- dashboard feels product-oriented, readable, and not over-designed

### What translates realistically to current project surfaces
**Directly reusable now:**
- overall shell layout for `apps/dashboard`
- nav taxonomy almost exactly matches current project intent
- overview card composition
- API key table pattern
- usage summary/progress/bar-chart composition
- embedded playground inside dashboard
- settings/account section structure

**Needs adaptation:**
- data values are entirely mocked and should map to current real surfaces gradually
- tabs may become routes if the existing dashboard app is route-based rather than tab-switched
- imported font loading should move out of inline `<style>` into app-level styling/token setup

**Best immediate implementation targets for current roadmap:**
- `Overview` shell wired to real API usage snapshot
- `API Keys` table mapped to current DB/API-key groundwork
- `Usage` panel backed by existing usage accounting work
- `Playground` adapted to current `/v1/companies/search`

This source is highly compatible with `B-04 Wire dashboard shell to real API data` in `docs/PROJECT_SURFACE.md`.

---

## 4. AdminPanel.tsx analysis

### High-level structure
The admin panel is a true operations dashboard, not a customer dashboard variant.

Main structure:
- **sidebar grouped by domain** (dashboards / infrastructure / settings)
- **top header with breadcrumb + system state chip**
- **12-column dense dashboard grid**

Major content blocks:
1. KPI row
2. customer overview table
3. data sources table
4. recent ingestion runs table
5. system health status card
6. live logs panel
7. recent transactions list

### Information architecture strengths
This source captures the admin surface the project docs describe very well:
- customer/account visibility
- billing visibility
- source/integration visibility
- ingestion-run visibility
- system health visibility
- logs/ops observability

It is especially relevant to:
- `B-05 Build admin status/operations surface beyond basic status page`
- `R-04 Admin shell review`

### Reusable UI patterns from admin
- grouped operational sidebar nav
- compact KPI cards
- dense data tables inside reusable `Card` shell
- generic `StatusBadge` pattern with semantic states
- split dashboard columns for data/ops/billing
- live log stream panel with severity coloring
- health checklist/status list
- monospace timestamps and metric readouts

### Styling direction
From `_admin-panel.css` + component use:
- **Dark ops theme**
- **Inter + JetBrains Mono**
- GitHub-dark-like palette: charcoal surfaces, muted gray text, blue accent, green/warn/red status colors
- compact density, smaller type, stronger operational feel
- minimal decoration; clarity first

### What translates realistically to current project surfaces
**Directly reusable now (structure, not exact theme):**
- admin IA and block composition for `apps/admin`
- sources/integrations table
- ingestion runs table
- system health card
- logs panel
- recent transaction snapshot
- reusable status badge semantics

**Needs adaptation:**
- convert to project-standard light-first admin design unless product direction is intentionally changed
- replace mocked customer/payment figures with real or scaffolded local API sources
- likely split the single giant overview into multiple admin routes/views as the app matures

**Best immediate implementation targets:**
- a real `Overview`/mission-control page in `apps/admin`
- sections backed by `/v1/admin/status` plus future ingestion/source endpoints
- keep live logs and full billing detail secondary until the source registry and ingestion summaries are more real

---

## 5. Cross-surface reusable patterns

These are the most valuable reusable abstractions across all three imports:

### Layout primitives
- sidebar shell
- centered max-width content container
- section intro block
- card wrapper with optional header/action area
- split two-column feature/content section

### Data display primitives
- KPI/stat card
- status badge/chip
- table with soft row hover
- progress bar
- activity/log row list
- mono code/data block

### Interaction patterns
- primary vs secondary CTA styling
- tab switcher / view toggle
- inline search form + results
- hover-revealed row actions
- compact health/status indicator chips

### Token directions worth standardizing
- shared mono font for keys/JSON/metrics
- consistent radius scale
- consistent border color system
- semantic colors for success/warning/error
- one shared accent blue across public/dashboard/admin, even if admin tone differs

---

## 6. Translation guidance by current project surface

### Public surface (`site/` today)
**High-confidence translation:** very high

Use from source:
- hero structure
- trust/logo band
- feature grid
- playground/code section
- pricing layout
- certification/trust strip
- footer information architecture

Modify for reality:
- claims, metrics, and coverage copy
- docs/playground routing
- remove or replace fake assets/statistics

### Customer dashboard (`apps/dashboard`)
**High-confidence translation:** very high

Use from source:
- shell layout
- nav structure
- overview cards
- API keys table
- usage panels
- billing card/history
- internal playground
- settings page structure

Modify for implementation:
- swap tabs to routes if needed
- wire to real local API data progressively
- move inline styling/fonts into app-level styling system

### Admin (`apps/admin`)
**High-confidence translation:** medium-high for structure, medium for styling

Use from source:
- information architecture
- KPI row + operational overview composition
- source/ingestion/health/log blocks
- status badge semantics

Modify for implementation:
- likely restyle to light-first per current project docs
- reduce data density at first if endpoints are still sparse
- prioritize source registry + ingestion visibility over fake MRR/log richness

---

## 7. Practical conclusions

1. **Landing page source is the clearest immediate upgrade path for `site/`.**
   It already matches the project’s public-product direction and can be adapted without major conceptual changes.

2. **User dashboard source is the best fit of the three.**
   Its structure almost exactly matches the documented customer area and current roadmap items.

3. **Admin source is strong in layout/IA but conflicts with the documented light-default visual direction.**
   Keep the structure, card patterns, tables, and status system; do not blindly copy the dark theme unless the design decision changes.

4. **The imports are best treated as pattern libraries and composition references, not production code to drop in wholesale.**
   They contain useful sections and components, but the content, data, claims, assets, and some styling mechanics are still mock-oriented.

5. **Most realistic near-term reuse order:**
   1. Public landing structure into `site/`
   2. Dashboard shell/patterns into `apps/dashboard`
   3. Admin information architecture into `apps/admin`

---

## 8. Recommended carry-forward checklist

- extract shared tokens: accent blue, neutral scale, mono usage, radii, badges
- reuse landing section hierarchy, but downgrade claims to real MVP truth
- implement dashboard shell nearly as-is, then replace placeholders with live API/DB-backed data
- port admin overview composition, but restyle to match current documented admin direction
- standardize reusable components: `StatCard`, `StatusBadge`, `PanelCard`, `DataTable`, `CodeBlock`, `SectionIntro`
