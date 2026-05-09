# Next Steps

## Current verified status
- frontend redesigned in a more SaaS/API style
- docs-first frontend built
- interactive playground added
- local API is running and tested
- Norway has real live test data in safe mode and visible source-backed search results in the local MVP
- UK has a documented live-test path plus input validation helper, but still needs a real API key for execution

## Immediate next steps
1. Clean up `site/index.html` so landing + docs + demo work together cleanly
2. Run `docs/UK_LIVE_TEST_RUNBOOK.md` with a real Companies House API key and capture one successful raw + normalized sample
3. Implement the shared country-ingest framework from `docs/COUNTRY_ONBOARDING_FRAMEWORK.md`
   - shared source definition/upsert model
   - real `ingestion_runs` bookkeeping
   - normalized contract validation
   - generalized DB ingest path beyond Norway-only code
4. Keep improving ranking, exact lookup, and result depth now that search visibly returns ingested rows

## Important backlog
- Build a real service frontend later (separate from project/docs site)
  - account/login
  - API keys
  - usage
  - billing
  - dashboard
  - request logs / developer console

## Notes
Stay focused on the current MVP path first:
- Norway + UK data integration
- stronger ingestion pipeline
- better live search results
- production-shaped docs/demo
