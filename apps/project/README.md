# Internal control surface

Canonical internal admin/backend/control surface for Company Data.

## Purpose

This app now serves as the default internal destination at `3014`.

It carries the internal board today, but it is also the canonical handoff target for internal admin/backend/control work so the product stops splitting that role across `3013` and `3014`.

### Boundary rule

- Public = product story, pricing, docs, coverage, safe demo
- Dashboard = signed-in customer self-service
- Internal control surface (`3014`) = operator/admin/backend/control work and internal execution planning
- Legacy admin (`3013`) = deprecated compatibility surface only

If a card starts reading like customer UX or public marketing, it should point back to those surfaces instead of absorbing them.

## Local run

```bash
cd apps/project
npm install
npm run dev
```

Default local dev URL: `http://localhost:3014`

## Build / local serving

```bash
npm run build
npm run preview
```

The production build is written to `dist-local/`.

## Notes

- Vite + React + TypeScript
- Local-first and lightweight by design
- Seeded from `docs/NEXT_STEPS.md`, `docs/BACKLOG.md` and recent verified project progress
- Uses the same light nordic direction as the other internal/product surfaces
- Acts as the canonical internal destination while still keeping public and customer workflows separate from internal/admin work
