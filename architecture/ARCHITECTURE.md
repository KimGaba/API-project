# Suggested Architecture

## Recommended stack
- Ingestion: Python
- API platform: TypeScript (Fastify or NestJS)
- Database: PostgreSQL
- Cache/rate limiting: Redis
- Billing: Stripe
- Background jobs: BullMQ or Python workers + queue
- Search: PostgreSQL first, OpenSearch later if needed
- Storage for raw dumps: S3-compatible bucket or filesystem

## Why this split
Python is better for ETL / parsing / registry ingestion.
TypeScript is strong for API products, billing, auth, dashboards, and developer experience.

## Services
1. ingest-worker
2. normalize-worker
3. api-server
4. admin-dashboard
5. postgres
6. redis
7. stripe-webhook-handler
8. docs/developer portal

## Non-functional requirements
- source attribution tracking
- audit trail per record
- quota enforcement
- idempotent ingestion jobs
- multi-country schema normalization
