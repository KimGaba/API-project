# Public Site Information Architecture

## Goal
Turn the current single public page into a **small, credible multi-page public site** that:
- keeps the existing **light nordic, calm, technical-product** direction
- stays aligned with the **actual MVP** instead of future-platform fiction
- separates **public evaluation** from **customer dashboard** and **internal admin** surfaces
- makes it easier to grow docs, coverage, and product explanation without stuffing everything into one page

---

## IA principles

### 1. Keep the public front door public
The public site should help a visitor answer:
- What is this?
- What can it do today?
- Which countries are live vs planned?
- How do I test it quickly?
- What does pricing roughly look like?

It should **not** become the place for:
- API key management
- billing operations
- usage dashboards
- ingestion controls
- admin status and operator views

### 2. Stay honest about current capability
The site should reflect current truth:
- Norway and UK are the real MVP focus
- Denmark and Finland are roadmap context, not live capability
- the public API contract is still small
- the live demo is a real strength and should remain prominent
- pricing is indicative/product-shaped, but some commercial mechanics are still scaffolding

### 3. Split by user intent, not by internal org chart
The current one-page surface mixes these intents:
- product evaluation
- technical docs/reference
- pricing/commercial framing
- country coverage understanding
- live testing

Those are all valid, but they should become **clean subpages** with a shared structure.

### 4. Preserve the current design tone
The public site should continue to feel:
- light mode first
- airy, nordic, restrained
- product-grade, not corporate-enterprise heavy
- technical and trust-building
- clearer on desktop, still clean on mobile

---

## Recommended public page set

This is the recommended **v1 public page architecture**.

### 1. `/` — Home
**Purpose:** Main product story and strongest first impression.

**Why it should exist:**
The homepage should stop trying to carry the full docs/reference burden. Its job is to explain the offer, prove it is real, and route people deeper.

**Primary content:**
- hero with concise value proposition
- short explanation of what the API does today
- proof strip built from real MVP facts
- 3–6 product capability blocks
- compact coverage preview
- compact pricing preview
- strong demo/docs CTA section

**What belongs here from the current page:**
- hero
- trust/proof strip
- “platform shape” / public-vs-other-surfaces framing, simplified
- capability cards
- compact coverage summary
- compact pricing summary
- closing CTA

**What should be removed from Home:**
- full endpoint reference
- full auth section
- full example payload blocks
- long error documentation
- detailed playground controls inline in the middle of the page

**Home page goal:**
Get a visitor to either:
- open the demo
- read docs
- inspect coverage
- inspect pricing

---

### 2. `/product` — Product
**Purpose:** Explain the product in more structured depth without becoming docs.

**Why it should exist:**
The current one-pager has product explanation, but it is squeezed between technical reference blocks. A dedicated product page lets the story breathe.

**Primary content:**
- what the Company Data API is
- who it is for
- current MVP use cases
- what the current API shape supports
- why surface separation matters (public vs dashboard vs admin)
- what is intentionally not in the MVP yet

**Recommended sections:**
1. Product overview
2. Core use cases
   - company search
   - registration lookup direction
   - developer evaluation
   - internal tool enrichment/pilot workflows
3. What exists now
4. What is coming next (short, disciplined roadmap)
5. Surface model
   - Public site
   - Customer dashboard
   - Admin

**Important tone:**
This page should sound like a product page for an early infrastructure product, not a visionary manifesto.

---

### 3. `/docs` — Developer docs landing
**Purpose:** Give developers a clean starting point into the small current API contract.

**Why it should exist:**
Docs are a major part of the product value, but they should be easier to scan than a long homepage section.

**Primary content:**
- base URL
- auth method
- quickstart request
- current endpoint list
- links to endpoint reference sections/pages
- example code snippets
- link to live demo

**Recommended sections:**
1. Quickstart
2. Authentication
3. Endpoints available now
4. Common examples
5. Error format
6. Next: try the live demo

**Scope discipline:**
This should document only what is currently verified:
- `GET /health`
- `GET /v1/meta/countries`
- `GET /v1/companies/search`

It can mention likely next endpoints separately as “planned” or “coming next”, but should not present them as already available.

---

### 4. `/playground` or `/demo` — API demo
**Purpose:** Keep the real interactive browser demo as a first-class evaluation tool.

**Why it should exist:**
The live demo is one of the strongest things the MVP already has. It deserves its own page so it is not competing with marketing copy and reference text.

**Primary content:**
- route selector
- API key input
- query/country/limit controls
- generated request preview
- raw JSON response
- formatted search results/cards
- short helper text about this being an evaluation demo

**Recommended framing:**
- keep it explicitly public and safe
- keep the default demo key visible
- make clear this is not the customer dashboard
- add links back to docs and coverage

**What not to add yet:**
- account creation flows
- saved requests
- request history
- heavy API-console features

---

### 5. `/coverage` — Country coverage
**Purpose:** Make country support understandable and trustworthy.

**Why it should exist:**
Coverage is strategically important for this product, and it will grow over time. It should not stay buried as one section among many.

**Primary content:**
- clear split between enabled and planned countries
- current MVP narrative: Norway first, UK second
- short notes per country
- source-status language that is honest and non-legalistic on the public page
- optional link to contact or docs where relevant

**Recommended structure:**
1. Coverage intro
2. Enabled now
   - Norway
   - United Kingdom
3. Planned next
   - Denmark
   - Finland
4. Coverage principles
   - live vs planned distinction
   - roadmap is not commitment

**Good public behavior:**
This page should feel useful to both buyers and engineers. It should answer “can I use this in my market?” quickly.

---

### 6. `/pricing` — Pricing
**Purpose:** Present a clear buying model without dragging operational billing UI into public pages.

**Why it should exist:**
Pricing matters commercially and is currently strong enough to present as product direction, even if the backend billing flow is still early.

**Primary content:**
- Free / Starter / Growth plan framing
- usage-based plan expectations
- what each tier roughly includes
- note that billing/account management happens in the customer area
- simple CTA: talk to us / get access / try demo

**Recommended structure:**
1. Pricing intro
2. Plan cards
3. What changes between tiers
4. Notes on evaluation and commercial maturity
5. CTA

**Tone guardrail:**
Do not oversell procurement readiness, SLAs, or enterprise ops that do not exist yet.

---

## Optional page set for v1.5, not required now

These should **not** be in the first cleanup unless there is bandwidth and content depth.

### `/about`
Useful later if brand/story/team credibility becomes important.

### `/status`
Only if there is a real public-safe status model. Right now admin status belongs elsewhere.

### `/contact` or `/access`
Useful later if you want a better commercial conversion path.

### `/changelog`
Potentially useful once product updates become frequent and real.

---

## Recommended top navigation

### Primary top nav
Use a **short, stable top nav**:
- Product
- Docs
- Coverage
- Pricing
- Demo

### Right-side actions
- Log in
- Get started / Try demo

### Why this nav works
It reflects the real public intents:
- understand the product
- verify the API contract
- check country availability
- assess pricing
- test it live

It is also cleaner than keeping homepage anchor links as the long-term public IA.

---

## Recommended footer navigation

Footer should repeat the site structure with slightly more explicit grouping.

### Product
- Home
- Product
- Coverage
- Pricing

### Developers
- Docs
- Demo
- API quickstart

### Company / platform
- Log in
- Dashboard (if public-safe link is appropriate)
- Admin should **not** be publicly promoted here

### Footer note
Small truthful note such as:
- “Public MVP surface focused on product explanation, docs, pricing, coverage, and a safe live demo.”

---

## Shared layout expectations across all public pages

All public pages should feel like one family.

### Shared header
- same brand mark and name
- same top nav
- same right-side action cluster
- sticky on desktop
- simple mobile menu

### Shared hero pattern
Not every page needs a huge homepage hero, but each page should open with:
- eyebrow/label
- concise H1
- 1–2 sentence orientation copy
- optional CTA row

### Shared content rhythm
Use a consistent page pattern:
- hero/introduction
- 2–4 content sections
- optional proof/status cards
- closing CTA or next-step block

### Shared components
Keep using and refining the current visual language:
- rounded cards
- light frosted/soft panels
- subtle borders
- restrained blue accent
- calm spacing
- compact chips and badges
- code blocks with strong readability

### Shared CTA behavior
Every page should help users move somewhere useful next:
- docs → demo
- product → coverage or pricing
- coverage → docs or demo
- pricing → demo or get started
- demo → docs

---

## Content allocation: what goes on which page

### Keep on Home
- concise product promise
- real proof metrics
- capability summary
- compact coverage preview
- compact pricing preview
- CTA to docs/demo

### Move to Product
- expanded product explanation
- who it is for
- current use cases
- public/dashboard/admin surface model
- what is intentionally out of scope

### Move to Docs
- auth
- quickstart
- endpoint reference
- examples
- errors

### Move to Demo
- full interactive playground
- generated request previews
- raw JSON responses
- formatted search cards

### Move to Coverage
- country list with live vs planned states
- short per-country readiness notes
- roadmap/context language

### Move to Pricing
- plan cards
- monthly request framing
- rate limit framing
- commercial direction note

### Remove from public nav / de-emphasize heavily
- static admin page as a public destination
- operator-focused status framing
- too much internal “surface architecture” explanation on the homepage

The public site can still acknowledge that dashboard and admin exist, but it should do so lightly and only where it helps reduce confusion.

---

## Recommended page hierarchy in practice

### Minimum viable public site structure
- `/` — Home
- `/product`
- `/docs`
- `/coverage`
- `/pricing`
- `/demo`

This is the cleanest practical split for the current project.

### If keeping implementation lightweight
A good transitional approach is:
- create real HTML routes/pages
- reuse the same shared CSS/design system
- move existing homepage sections into those pages with modest rewriting
- keep the current one-pager as the content source, not as the long-term IA

---

## Homepage recommendation in more detail

The homepage should become shorter and sharper.

### Recommended homepage order
1. Hero
2. Proof strip
3. Product capability cards
4. Compact “how evaluation works” section
5. Compact coverage preview
6. Compact pricing preview
7. CTA section

### Homepage sections to remove entirely
- full endpoint docs
- full auth reference
- full error reference
- long example gallery
- full embedded playground UI

### Homepage section to keep only as preview
A small preview block for docs/demo is good. The full experience belongs on its own pages.

---

## Docs IA recommendation

If docs stay a single page at first, that is fine. But structure them like a proper docs page, not a homepage subsection.

### Recommended docs left-nav or section order
- Quickstart
- Authentication
- Endpoints
  - `GET /health`
  - `GET /v1/meta/countries`
  - `GET /v1/companies/search`
- Examples
- Errors
- Demo handoff

### Later docs expansion path
When more endpoints become real, docs can naturally split into:
- `/docs`
- `/docs/authentication`
- `/docs/endpoints/search`
- `/docs/endpoints/countries`
- `/docs/errors`

Not necessary yet, but the IA should leave room for it.

---

## Coverage IA recommendation

Coverage should be more than a grid of cards.

### Recommended content model per country card/block
- country name and code
- state: enabled / planned
- short plain-English note
- source status label if useful
- optional “available in demo” cue for enabled countries

### Important wording rule
Use product language, not internal legal/ops language, on the public page.
For example:
- good: “Enabled in the current MVP”
- good: “Planned next”
- less good: “Operational dependence under review”

The deeper legal/source nuance belongs in internal docs, not public IA.

---

## Pricing IA recommendation

Pricing should feel credible, not final-final.

### Recommended plan presentation
For each plan show:
- who it is for
- monthly request allowance
- rate limit posture
- feature access level

### Public note to include
A small note like:
- “Pricing reflects current MVP product direction and may evolve as coverage and account features mature.”

That keeps the page honest without making it feel temporary or shaky.

---

## Relationship to dashboard and admin surfaces

### Public site should link clearly to dashboard login
A small “Log in” or “Dashboard” action is enough.

### Public site should not promote admin
The admin surface is not a public conversion target. The current `site/admin.html` should be treated as:
- temporary
- fallback
- not part of the long-term public IA

### Public copy should reinforce surface separation gently
Useful phrasing:
- “Public site for evaluation; account and operations tools live in separate surfaces.”

That is enough. No need to over-explain internal architecture in top-level nav.

---

## Suggested URL map

- `/`
- `/product`
- `/docs`
- `/coverage`
- `/pricing`
- `/demo`
- `/login` or dashboard handoff URL

Optional later:
- `/about`
- `/contact`
- `/changelog`

Not recommended as public primary IA today:
- `/admin`
- public status page tied to operator data

---

## Migration plan from the current one-page site

### Phase 1 — IA split without major redesign
- keep current visual system
- create 5–6 real pages
- move existing sections into their appropriate pages
- shorten homepage substantially
- move full playground to `/demo`
- move full docs/reference to `/docs`
- move full coverage block to `/coverage`
- move full pricing block to `/pricing`

### Phase 2 — Tighten page-specific copy and hierarchy
- rewrite heroes so each page has one job
- improve cross-links between docs/demo/coverage/pricing
- remove leftover one-page anchor-thinking from nav and CTAs

### Phase 3 — Grow only where reality supports it
- add deeper docs pages when endpoints become real
- expand coverage content as countries truly onboard
- add stronger commercial conversion once account flow is real

---

## Final recommendation

The cleanest public IA for the current project is a **6-page public surface**:
- **Home**
- **Product**
- **Docs**
- **Coverage**
- **Pricing**
- **Demo**

This is enough structure to feel like a real product site, while still staying honest about the current MVP.

The main correction is simple: **stop making the homepage do every job at once**.

Keep the homepage persuasive and calm.
Keep docs technical.
Keep the demo first-class.
Keep coverage explicit.
Keep pricing simple.
Keep dashboard/admin concerns out of the public front door.
