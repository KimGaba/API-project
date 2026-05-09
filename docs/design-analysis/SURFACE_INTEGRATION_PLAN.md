# Surface Integration Plan

## Goal
Apply the imported design language from `design-import/` to the three real product surfaces without blindly porting the mockups. The imported files are strong visual references, but the live apps already have better MVP truth around data, scope separation, and local API wiring.

## Design source truth to carry across all surfaces

### Reuse across the whole system
- **Tone:** light-first, Nordic, airy, calm, credible, product-oriented.
- **Core visual ingredients:** soft background gradients, white/glass panels, rounded cards, restrained borders, muted secondary text, strong but not loud accent color.
- **Navigation model:** clear left/right separation between primary app nav and content; obvious surface handoff between public, dashboard, and admin.
- **Content hierarchy:** strong headline -> short explanation -> action area -> supporting stats/cards.
- **Component families worth standardizing:**
  - hero/header band
  - stat card
  - section card/panel
  - table/list rows
  - status pills/badges
  - code/snippet blocks
  - search/result cards

### Adapt across the whole system
- **Accent palette:** current public/dashboard/admin each drift a bit. Normalize around one shared brand system with surface-specific emphasis, not three separate brands.
- **Typography:** the import uses a more polished product-marketing rhythm than the current apps. Keep the current stack if needed, but tighten weights, spacing, and headline scale.
- **Glass treatment:** use lightly. It works best on hero/nav/surface framing, not on every operational table.
- **Mock KPIs and claims:** keep the structure, replace the fake scale claims with real MVP-facing truth.

### Ignore or defer across the whole system
- Huge enterprise-scale numbers from the import (`40M+`, `32 countries`, etc.) until true.
- Features not in current product scope: UBO, financials, webhooks, bulk dumps, deep compliance suites.
- Screenshot-perfect cloning when it fights current information architecture.
- Full component-system extraction before the surface structures settle.

---

## Surface 1: Public
**Current surface:** `site/index.html`
**Imported source anchor:** `design-import/LandingPage.tsx`
**Screenshot intent:** polished SaaS/API landing page with trust, speed, docs, and live demo in one flow.

### What to reuse directly
- **Landing page section model** from `LandingPage.tsx`:
  - sticky top nav
  - strong hero with CTA pair
  - trust/proof band
  - API/code showcase block
  - features grid
  - coverage section
  - pricing section
  - closing CTA
  - structured footer
- **Visual grammar** already compatible with the current site:
  - rounded cards
  - soft blue/neutral palette
  - clear contrast between marketing sections and code areas
  - badges/pills for status and metadata
- **Code showcase concept** from the import should directly shape the current demo intro because it matches the “engineer-first” product story.

### What to adapt
- **Keep the current live playground** from `site/index.html` instead of replacing it with the static mock code sample from the import.
  - The import’s request/response tabs are good visual inspiration.
  - The current playground is more valuable because it actually hits the local API.
- **Merge current docs/demo realism with imported storytelling.**
  - Current site is stronger on verified endpoint truth.
  - Imported design is stronger on product positioning and visual flow.
- **Trust/logo strip:** keep as a placeholder design motif only; do not present fake customer proof as real proof.
- **Coverage section:** preserve current “enabled vs planned” honesty rather than the import’s broad implied coverage.
- **Pricing cards:** use imported card hierarchy and CTA treatment, but keep the current MVP pricing posture and disclaimers.
- **Navigation labels:** use the three-surface model already documented (`Product`, `Docs`, `Pricing`, `Coverage`, `Demo`, plus login/get started).

### What to ignore or defer
- Fake institutional trust claims, certifications, or uptime/SLA claims unless verified.
- Decorative map/hero imagery if it slows implementation or adds asset debt.
- Deep footer/company/about content until the core product story is stable.
- Fancy tabbed terminal mockup as the main experience; the working browser playground matters more.

### Recommended implementation order
1. **Adopt imported public IA and visual rhythm** on top of the existing page structure.
2. **Refactor hero + top nav** to feel closer to `LandingPage.tsx`.
3. **Upgrade trust/product sections** using imported feature-card and proof-band patterns.
4. **Restyle the current live playground** using the imported code-panel language.
5. **Reshape pricing + coverage** with imported layout patterns but current truthful content.
6. **Finish footer/CTA polish** only after the main sections feel coherent.

### Public surface verdict
- **Direct reuse level:** high on layout patterns and section sequencing.
- **Adaptation level:** high on content truth and live demo integration.
- **Best rule:** import the polish, keep the current reality.

---

## Surface 2: Dashboard
**Current surface:** `apps/dashboard`
**Imported source anchor:** `design-import/UserDashboard.tsx`
**Screenshot intent:** modern signed-in customer workspace with calm metrics, key management, usage visibility, billing, and playground.

### What to reuse directly
- **Sidebar dashboard shell** from `UserDashboard.tsx` is the right base pattern for this app.
- **Tab set and section mix** are already very aligned with the current app:
  - Overview
  - API Keys
  - Usage
  - Playground/Search
  - Billing
  - Settings
- **Card language** from the import is immediately reusable:
  - metric cards with small icon/status affordances
  - clean data tables
  - billing summary card
  - simple settings forms
  - search result split view (human-readable details + JSON)
- **Signed-in calm/product feel** is stronger in the import than the current dashboard and should become the target tone.

### What to adapt
- **Do not copy the imported dashboard one-to-one.** The current app already has better product truth in some places:
  - explicit docs handoff
n  - explicit admin handoff
  - local API metadata loading
  - theme persistence
  - real search wiring to `/v1/companies/search`
- **Use imported layout patterns to upgrade the current React app, not replace it.**
  - Keep the current route/section structure.
  - Rework visual hierarchy, spacing, card composition, and data presentation.
- **Overview page:**
  - use imported stat-card density and recent activity treatment
  - keep current source-count / API-base / readiness information because it reflects real MVP status
- **API keys page:**
  - adopt imported table treatment and action affordances
  - keep current demo-key copy flow and realistic local snippets
- **Usage page:**
  - import chart/layout ideas carefully
  - keep current “good enough until real billing sync” honesty
- **Billing page:**
  - use imported billing summary and history structure
  - keep the current scaffold-aware messaging because checkout is not finished
- **Playground page:**
  - combine current working search with imported two-column result presentation
  - this is one of the highest-value direct upgrades from the import

### What to ignore or defer
- Fake named users, companies, invoices, and polished growth-tier business data as if real.
- Notification/profile chrome that is purely decorative for now.
- Full multi-user/team-management assumptions before auth and account models are real.
- Heavy charting work before live data hookup is stronger.

### Recommended implementation order
1. **Re-skin the shell first:** sidebar, topbar, spacing, card system, pills, tables.
2. **Upgrade Overview** to match imported dashboard quality while preserving current live metadata blocks.
3. **Upgrade Playground/Search** next because it already has real API value and benefits most from better presentation.
4. **Upgrade API Keys** with stronger table/actions/snippet layout.
5. **Upgrade Billing and Usage** after shell/components are shared.
6. **Finish Settings/Account polish** last.

### Dashboard surface verdict
- **Direct reuse level:** high on layout shell, nav shape, card patterns.
- **Adaptation level:** medium-high because current app already contains better MVP-specific logic.
- **Best rule:** preserve the current product wiring, import the stronger customer-product presentation.

---

## Surface 3: Admin
**Current surface:** `apps/admin` (primary), `site/admin.html` (legacy fallback)
**Imported source anchor:** `design-import/AdminPanel.tsx`
**Screenshot intent:** dense operator console for monitoring customers, billing, sources, ingestion runs, health, and logs.

### What to reuse directly
- **Admin information architecture** from `AdminPanel.tsx` maps well to current needs:
  - customers/users
  - billing
  - API activity
  - data sources
  - ingestion runs
  - system health
  - logs/config
- **Operational dashboard density** in the import is useful:
  - KPI strip
  - large tables
  - recent run panels
  - health/status blocks
  - logs panel
- **Distinct operator identity** should be kept. Admin should feel more compact and control-oriented than dashboard/public.

### What to adapt
- **Keep the current light-default admin as the real baseline.**
  - The import is darker and more “mission control”.
  - The documented product direction says light mode default everywhere.
  - So reuse structure and density, not the dark-first palette.
- **Use import patterns to improve the current React admin sections** rather than revert to the exact imported visual style.
- **Align imported tables/panels to real local API payloads** from `/health`, `/v1/admin/status`, and `/v1/billing/plans`.
- **Preserve current fallback-aware behavior.**
  - The current admin is intentionally resilient when API endpoints are missing.
  - That is more important than screenshot fidelity.
- **Treat `site/admin.html` as a fallback utility page only.**
  - Pull minimal shared styling from the new admin language.
  - Do not invest heavily in its layout beyond clarity and consistency.

### What to ignore or defer
- Imported fake operator data, fake logs, and fake MRR should not become the source of truth.
- Dark, high-drama command-center look as the primary visual direction.
- Operator controls that imply destructive actions before backend capabilities exist.
- Complex config/settings sub-areas before the main source/run/system sections are stable.

### Recommended implementation order
1. **Lock the admin shell and section hierarchy** using the import as the layout reference.
2. **Rework the current cards/tables/status components** into a denser operator component set.
3. **Upgrade Sources + Ingestion Runs first** because these are the most MVP-relevant admin jobs.
4. **Upgrade System Status + Database sections** next using cleaner health and note panels.
5. **Upgrade Users/Billing/API Usage** after the source/ops areas are solid.
6. **Lightly align `site/admin.html`** as a fallback page, but keep it secondary.

### Admin surface verdict
- **Direct reuse level:** medium-high on IA and panel patterns.
- **Adaptation level:** high on theme, truthfulness, and fallback behavior.
- **Best rule:** use the import as an ops-layout reference, not as a color/theme mandate.

---

## Cross-surface implementation sequence

### Phase 1 — Shared language foundation
1. Define shared tokens:
   - background
   - panel/surface
   - border
   - primary accent
   - success/warn/danger
   - typography scale
   - radii/shadows
2. Define shared component primitives to mirror the imported language:
   - section header
   - stat card
   - panel
   - pill/badge
   - table row styling
   - snippet/code block
3. Normalize visual consistency across `site/`, `apps/dashboard`, and `apps/admin` before deep feature work.

### Phase 2 — Public first
1. Refactor public nav + hero
2. Bring in imported feature/trust/pricing rhythms
3. Restyle live playground to match the imported product language
4. Keep content honest to the current MVP

### Phase 3 — Dashboard second
1. Rework shell/sidebar/topbar
2. Upgrade overview cards and tables
3. Upgrade playground/results view
4. Upgrade API keys, usage, billing, settings

### Phase 4 — Admin third
1. Tighten shell and section hierarchy
2. Improve source/run/system panels
3. Improve user/billing/usage sections
4. Keep legacy static admin page as fallback only

---

## Final recommendation
If there is only time for one guiding principle:

- **Public:** borrow the imported landing-page polish aggressively.
- **Dashboard:** borrow the imported signed-in shell and card system, but preserve current real wiring.
- **Admin:** borrow the imported operator layout density, but keep the current light-default, fallback-aware product direction.

The imported design language is strongest as a **visual system and section model**, not as literal source-to-source replacement. The current apps already contain the better MVP truth; the import should make them feel more intentional, coherent, and product-grade.