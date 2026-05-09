# App Structure

## Three-surface model

### 1. Public Frontend (`site/` today, later `apps/site`)
Audience:
- visitors
- prospects
- developers evaluating the product

Purpose:
- present the product
- explain value and coverage
- expose docs and pricing
- provide a low-friction demo/playground
- convert visitors into signups

Core nav:
- Product
- Docs
- Pricing
- Coverage
- API Playground
- Login / Get Started

Design intent:
- light mode default
- nordic, airy, trust-building, polished
- strongest brand/story layer

---

### 2. User Area (`apps/dashboard`)
Audience:
- logged-in customers

Purpose:
- manage API usage
- create/manage API keys
- view plan/billing
- inspect usage and stats
- test requests
- access docs from inside the product

Core nav:
- Overview
- API Keys
- Usage
- Billing
- API Playground
- Docs
- Account Settings

Design intent:
- light mode default
- data/product oriented
- clean, calm, practical
- dark mode available as optional mode

---

### 3. Internal control surface (`3014`, currently `apps/project`)
Audience:
- operators / internal admins
- internal builders
- agents working on delivery

Purpose:
- serve as the canonical internal admin/backend/control surface
- monitor users
- inspect subscriptions/payments
- inspect API usage
- review integrations/sources
- inspect ingestion runs
- inspect database/system status
- track roadmap and implementation progress where useful for the same internal audience

Core nav:
- Overview
- Users
- Billing
- API Usage
- Sources / Integrations
- Ingestion Runs
- Database Overview
- System Status
- Logs
- Project / Delivery

Design intent:
- light mode default
- compact, functional, operational
- less marketing, more control surface
- one clear internal destination instead of split admin-vs-project surfaces

---

### 4. Deprecated legacy admin app (`apps/admin`)
Audience:
- legacy/internal only during migration

Purpose:
- temporary compatibility surface while internal admin expectations move to `3014`

Direction:
- do not treat this as the long-term primary internal destination
- keep references explicit when discussing migration or legacy behavior

---

## Cross-cutting rules
- same design language across the public, dashboard, and internal surfaces
- light mode is the default everywhere
- dark mode is optional, never the baseline
- shared typography, spacing, and component behavior
- avoid mixing public/docs/customer concerns into the internal control surface unless the internal audience explicitly needs them

## Current state
- `site/` currently acts as the active public/docs/API-playground surface
- `apps/dashboard` exists as the signed-in customer surface
- `apps/project` is the active/canonical internal control-surface direction on `3014`
- `apps/admin` is a deprecated legacy internal app and should not be treated as the preferred long-term admin entry point
- `site/admin.html` remains a static fallback admin status page only

## Fixed local port mapping
- `3010` = public frontend
- `3011` = API
- `3012` = customer dashboard
- `3014` = canonical internal admin/backend/control surface
- `3013` = deprecated legacy internal admin app port

Important: `3014` is canonical. `3013` is deprecated and should only be referenced for migration, fallback, or compatibility context.

## Migration direction
1. keep `site/` alive as current public/docs/demo surface
2. evolve `apps/dashboard` into the real user area
3. consolidate internal admin/backend/control-surface expectations onto `3014`
4. treat `apps/admin` / `3013` as deprecated migration-era artifacts
5. gradually reduce mixed concerns in `site/index.html`
