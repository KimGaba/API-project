# Design Integration Plan

## Goal
Use both the provided screenshots and imported source code as the combined design truth for the three main surfaces:
1. Public frontend
2. Customer dashboard
3. Admin

## Agent plan

### Agent A — Source analysis
Input:
- `design-import/LandingPage.tsx`
- `design-import/UserDashboard.tsx`
- `design-import/AdminPanel.tsx`
- imported CSS files

Goal:
- identify component structure, sections, reusable layout ideas, and what can be translated into the current apps

### Agent B — Screenshot ↔ source mapping
Input:
- provided screenshots
- imported source files

Goal:
- map each screenshot to the matching source component
- identify what the images confirm, what the code contains, and what should be treated as reference truth

### Agent C — Implementation plan per surface
Input:
- current project apps
- outputs from source analysis + mapping

Goal:
- define exactly what to change for:
  - public surface
  - dashboard
  - admin
- split into direct reuse, adapted reuse, and ignore/defer

## Execution order
1. Analyze design source
2. Cross-check against screenshots
3. Produce concrete surface-by-surface integration plan
4. Start implementation waves after plan approval or continue directly if confidence is high

## Success criteria
- one clear design direction per surface
- reduced guesswork
- faster implementation with fewer redesign loops
