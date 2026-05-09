# Internal Surface Consolidation Recommendation

## Context

The new decision is explicit:

- `3014` is the **single internal admin/backend/control surface**.
- `3013` is deprecated.
- Admin and project board should no longer be treated as separate long-term destinations.

This recommendation reviews the current split between `apps/admin` and `apps/project` and proposes the most practical consolidation path.

---

## Executive recommendation

**Keep the `apps/admin` product shape and operational logic.**
**Merge the useful parts of `apps/project` into that internal surface as a delivery/planning section.**
**Move the unified app to port `3014`, then deprecate `apps/project` as a standalone app and retire `3013`.**

In plain terms:

- `apps/admin` already behaves like the real internal control surface.
- `apps/project` is not a second control surface; it is a static planning board.
- The right end state is **one internal app on `3014`** with:
  - operations / customers / billing / pipelines / system health from admin
  - a delivery / roadmap / board view migrated from project

---

## What exists today

## `apps/admin`

### What it currently is
A real operator-facing app with live API wiring and a broader internal runtime role.

### Evidence
- Fetches live internal data from:
  - `GET /health`
  - `GET /v1/admin/status`
  - `GET /v1/admin/overview`
  - `GET /v1/billing/plans`
- Has established operator sections:
  - Overview
  - Customers
  - Billing
  - Data pipelines
  - System health
- Uses explicit operator/admin language throughout:
  - "Company Data Ops"
  - "Operator console"
  - "Internal control surface"
- Is the only one of the two apps that already acts like a real backend-facing control UI.

### Current weaknesses
- Hard-coded identity and copy still point to `3013`.
- It is implemented as a standalone app when the new direction says the internal destination should be `3014`.
- It does not yet include the delivery/planning view that `apps/project` currently owns.

## `apps/project`

### What it currently is
A lightweight static board for internal delivery planning.

### Evidence
- Pure seeded React board; no live API integration.
- Main purpose is presentation of planning docs and current work state.
- It frames itself as the old "fourth surface" and repeatedly reinforces separation from admin.
- It contains useful information architecture for planning, but not a distinct long-term product surface.

### Current weaknesses
- Directly conflicts with the new migration decision.
- Reinforces the now-obsolete model:
  - public
  - dashboard
  - admin
  - project board
- Its content is important, but its app-level separation is no longer justified.

---

## Recommended end state

## 1. Single app on `3014`
The only internal destination should be:

- `3014` = unified internal surface

That app should contain both:
- **operations/admin work**
- **delivery/planning work**

## 2. Functional hierarchy inside the unified app
Use one internal shell with sections, not two separate apps.

Recommended top-level IA:

- Overview
- Customers
- Billing
- Data pipelines
- System health
- Delivery

Optional future split under Delivery:
- Board
- Roadmap
- Review queue
- Release notes / deployment state

This keeps the planning view available without pretending it is a separate surface.

## 3. Naming direction
Recommended naming:

- App label: **Company Data Internal** or **Company Data Ops**
- Avoid retaining "Project board" as an app name
- Treat "Project board" as a subsection label under Delivery, not the product name of a separate app

Best practical choice:
- keep the current `Company Data Ops` tone if speed matters
- add a `Delivery` section and stop calling that section a separate surface

---

## Keep / merge / deprecate / rename

## Keep

### Keep from `apps/admin`
Keep nearly all of the current admin app as the base for consolidation:

- navigation structure
- live data loading patterns
- operator overview cards
- customers view
- billing view
- pipelines view
- system health view
- overall visual language and app shell

Reason: this is already the real internal application.

### Keep from `apps/project`
Keep the **content model and board concepts**, not the separate app boundary:

- board columns (`backlog`, `in-progress`, `review`, `deployed`, `done`)
- card model
- source-backed planning mindset
- role-boundary notes only where still useful
- delivery status summaries
- backlog/review/deployed/done framing

Reason: the planning information is useful; the standalone app is not.

## Merge

### Merge `apps/project` into `apps/admin` as a new section
Recommended target:

- add `delivery` as a new nav item in `apps/admin`
- move the board UI from `apps/project/src/App.tsx` into a dedicated component/module under `apps/admin`
- adapt copy so it reads as an internal section, not a separate surface

Suggested new admin nav item:
- `delivery` → eyebrow: `Roadmap & execution`
- title: `Delivery`
- description: `Track current work, blockers, review items, and release state alongside operational status.`

### Merge docs and language
Replace language that implies two destinations:
- "Admin" and "Project board" as separate surfaces

With language that implies one internal surface with multiple modes:
- "Internal"
- "Operations"
- "Delivery"

## Deprecate

### Deprecate standalone `apps/project`
After its board is merged into the unified app:

- stop running `apps/project` as a standalone app
- stop describing it as the fourth surface
- remove docs that treat it as a separate destination
- eventually archive or remove the directory after migration is complete

### Deprecate `3013`
Immediately mark as legacy/intermediate only.

Concrete implications:
- remove `3013` from README defaults
- remove `Admin on :3013` UI copy
- change compose/dev defaults so internal UI resolves to `3014`

## Rename

### Ports
- `3014` remains canonical internal port
- `3013` should be renamed in docs as legacy/deprecated only

### Package/app naming
Recommended eventual package naming:
- from `@company-data/admin`
- to `@company-data/internal`

Possible staged approach:
1. keep filesystem/package names temporarily for low-risk migration
2. first unify behavior and port
3. rename package/directory once stable

This is less disruptive than renaming first.

---

## Practical implementation plan

## Phase 1 — Make `apps/admin` the canonical runtime on `3014`

Do this first.

### Changes
- Change `apps/admin/vite.config.ts` default port from `3013` to `3014`
- Change all admin README and UI copy from `3013` to `3014`
- Change compose `admin` service default port mapping from `3013` to `3014`
- Update any internal docs that still describe `3013` as primary

### Why first
This aligns runtime behavior with the decision before any bigger UI merge.

## Phase 2 — Add Delivery section inside `apps/admin`

### Changes
- Add a new nav item in `apps/admin`:
  - `delivery`
- Extract board data + board rendering from `apps/project`
- Rebuild that view inside `apps/admin` under Delivery
- Reword copy so it no longer says:
  - "fourth surface"
  - "separate from admin"

### Result
The useful project board survives, but only as an internal section.

## Phase 3 — Freeze `apps/project`

### Changes
- Stop feature work in `apps/project`
- Add a deprecation notice in its README
- Point readers to the unified internal surface on `3014`

### Result
No new ambiguity about where internal work belongs.

## Phase 4 — Retire `apps/project` standalone app

After the Delivery section in admin is accepted:

- remove `apps/project` from active app roster
- optionally keep a short migration stub briefly if needed
- eventually delete/archive it

---

## Specific recommendations by artifact

## `apps/admin`
### Recommendation
**Keep and promote to the single internal app.**

### Concrete changes
- keep codebase as consolidation base
- update port default to `3014`
- remove `:3013` references in UI text
- add Delivery section
- optionally rename later to `apps/internal`

## `apps/project`
### Recommendation
**Deprecate as a standalone app; merge its board into admin.**

### Concrete changes
- keep board concepts
- migrate UI into admin
- stop treating as independent surface
- retire directory after migration stabilizes

## `docs/PROJECT_SURFACE.md`
### Recommendation
Revise surface model.

### Replace
- Admin = internal operator control surface
- Project board = internal delivery planning and execution state

### With
- Internal = admin, operations, delivery planning, and system control in one surface

## `docs/APP_STRUCTURE.md`
### Recommendation
Update port and role mapping.

### Replace
- `3013` = internal admin
- `3014` = project board

### With
- `3014` = unified internal surface
- `3013` = deprecated legacy port only

## `docker-compose.yml`
### Recommendation
Make the internal service resolve to `3014`.

Practical note:
- whether the service stays named `admin` temporarily is less important than the runtime/port behavior
- service rename can happen later if desired

---

## What not to do

## Do not keep both apps as peer long-term surfaces
That preserves the exact ambiguity the migration doc is trying to remove.

## Do not rebuild from `apps/project`
`apps/project` is too static and too narrow. It should contribute a section, not become the base shell.

## Do not rename everything before unifying behavior
Port/runtime/UX consolidation is the important change. Big renames can come after the app is actually unified.

---

## Final recommendation

If only one sentence survives, it should be this:

**Use `apps/admin` as the base, move it to `3014`, add `Delivery` by absorbing the useful board functionality from `apps/project`, then deprecate `apps/project` and retire `3013`.**

That is the lowest-risk path, matches the current implementation reality, and aligns cleanly with the new decision that `3014` is the single internal admin/backend/control surface.
