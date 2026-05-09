# API app scaffold

Lean Fastify + TypeScript API skeleton for the European company data MVP.

## Endpoints
- `GET /health`
- `GET /v1/meta/countries`
- `GET /v1/companies/search?q=&country=`
- `GET /v1/admin/status`
- `GET /v1/admin/overview`
- `GET /v1/billing/plans`
- `POST /v1/billing/webhooks/stripe` — local storage scaffold only

## Local dev
```bash
cp .env.example .env
npm install
npm run dev
```

## Clean local build
```bash
npm run check
npm run build
```

If `npm run build` fails with a permission error, run:

```bash
npm run doctor:permissions
```

That script highlights root-owned files under `dist/` or `node_modules/` and prints the exact ownership fix to run before rebuilding.

## Docker
```bash
docker build -t company-data-api .
docker run --rm -p 3000:3000 --env-file .env company-data-api
```

## Notes
- API key middleware prefers DB-backed hashed keys from `api_keys` and falls back to `API_KEYS` for local/dev safety.
- Successful DB-authenticated requests append `usage_events` and upsert monthly `usage_counters`.
- Search is placeholder data until DB + ingestion land.
- Billing now has a Stripe-ready local skeleton for plan config and webhook event storage, but checkout/signature verification/subscription sync are still intentionally unfinished.
- Structure is ready to grow into auth, usage, billing, and real company modules.
