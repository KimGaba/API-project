# API Product Draft

## Free Plan
- 100 requests/month
- 5 requests/minute
- search + single company lookup
- no bulk
- no change feeds

## Starter Plan
- 10,000 requests/month
- 60 requests/minute
- search + lookup + VAT lookup

## Growth Plan
- 100,000 requests/month
- 300 requests/minute
- changes endpoint
- enrichment endpoint

## Suggested endpoints
- GET /v1/companies/search?q=&country=
- GET /v1/companies/{id}
- GET /v1/companies/registration/{country}/{number}
- GET /v1/companies/vat/{vat}
- GET /v1/companies/{id}/changes
- GET /v1/meta/countries

## Billing and auth
- API key per account
- Stripe checkout for paid tiers
- Stripe webhook to provision/update quotas
- monthly usage reset job
