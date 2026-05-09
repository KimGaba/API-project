# Role Cleanup Plan

## Goal
Sharpen each main surface so it clearly serves its own role and does not leak concerns from the others.

## Principle
- Public = product, docs, pricing, coverage, demo
- Dashboard = signed-in customer self-service
- Admin = operator/internal control surface
- Project board = internal delivery planning

## Cleanup wave

### Admin cleanup
Remove or demote anything that feels:
- customer-ish
- self-service
- demo-ish
- marketing-ish
- docs-first unless operationally relevant

Admin should prioritize:
- integrations
- ingestion runs
- platform usage
- customers overview
- billing overview
- database/system status
- alerts / warnings / failures

### Dashboard cleanup
Remove or demote anything that feels:
- admin-ish
- global platform ops
- internal diagnostics not relevant to a customer

Dashboard should prioritize:
- account overview
- API keys
- usage
- billing
- request testing / docs handoff
- account settings

### Public cleanup
Remove or demote anything that feels:
- internal/admin
- signed-in workflow heavy
- too implementation-specific for a prospect

Public should prioritize:
- product explanation
- trust
- docs entry
- pricing
- coverage
- safe playground/demo

### Project board cleanup
Keep it strictly internal and execution-focused.
- no customer/admin/public confusion
- board clarity > product polish

## Success condition
Someone should understand in under 5 seconds:
- what this surface is for
- who it is for
- what actions belong there
