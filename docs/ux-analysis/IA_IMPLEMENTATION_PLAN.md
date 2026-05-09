# IA Implementation Plan

## Goal
Turn the UX/IA analysis into concrete implementation work for:
- Customer dashboard
- Admin console
- Shared shell/navigation/design consistency

## Workstreams

### WS-01 Dashboard IA implementation
Target:
- keep one shell
- convert sections into real routed views
- make Overview the only true dashboard page
- move API Keys / Usage / Billing / Playground / Settings into focused pages
- demote docs into utility/handoff behavior

### WS-02 Admin IA implementation
Target:
- split admin into real multi-view operator tool
- make Overview a triage page
- create dedicated views for:
  - Customers
  - Billing
  - Data Pipelines
  - System Health
- push heavy details/tables out of the overview

### WS-03 Shared shell + navigation consistency
Target:
- page titles
- active nav states
- shared spacing rules
- breadcrumb/title logic if needed
- less duplicated messaging

### WS-04 Visual density / scanability pass
Target:
- reduce equal-weight cards
- use cards for summary, tables for operations, pages/drawers for detail
- create lighter but clearer hierarchy

### WS-05 Copy/context polish
Target:
- remove repeated status text
- make actions context-specific
- reduce mixed role language

## Execution order
1. Dashboard IA
2. Admin IA
3. Shared shell/navigation
4. Density/scanability pass
5. Copy/context polish

## Success conditions
- dashboard clearly feels like customer self-service
- admin clearly feels like operator control surface
- overview pages become thinner and faster to scan
- heavy detail moves into dedicated routes/views
