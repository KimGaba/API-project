# Billing / Stripe groundwork

This is a **local scaffold**, not a complete billing integration.

What exists now:
- environment variable layout for Stripe product/price IDs
- a code-level billing plan map in `apps/api/src/config/billing.ts`
- a local webhook intake route that stores Stripe-like events in `webhook_events`
- explicit docs about what is still missing before checkout/billing can be considered real

What does **not** exist yet:
- Stripe SDK usage
- signature verification
- checkout session creation
- customer creation/sync
- subscription state reconciliation into `customers` / `subscriptions`
- invoice handling
- entitlement/quota updates triggered by billing state

## Product and price modeling plan

Use one internal plan map and let Stripe IDs be environment-configured:

- `free`
  - local/default only
  - not required to exist as a Stripe product
- `starter`
  - one Stripe product
  - monthly + yearly recurring prices
- `growth`
  - one Stripe product
  - monthly + yearly recurring prices
- `enterprise`
  - product optional
  - usually manual sales / manual provisioning first

Environment keys intentionally mirror that shape:

- `STRIPE_PRODUCT_STARTER_ID`
- `STRIPE_PRICE_STARTER_MONTHLY_ID`
- `STRIPE_PRICE_STARTER_YEARLY_ID`
- `STRIPE_PRODUCT_GROWTH_ID`
- `STRIPE_PRICE_GROWTH_MONTHLY_ID`
- `STRIPE_PRICE_GROWTH_YEARLY_ID`
- `STRIPE_PRODUCT_ENTERPRISE_ID`

Why this shape:
- keeps code stable across test/live
- avoids hardcoding price IDs in source
- makes plan-to-quota mapping explicit in one place
- leaves room for yearly discounts without changing DB enums yet

## Local webhook storage flow

Current route:
- `POST /v1/billing/webhooks/stripe`

Current behavior:
1. only works when `BILLING_WEBHOOK_STORAGE_ENABLED=true`
2. requires `DATABASE_URL`
3. expects a Stripe-like JSON payload containing:
   - `id`
   - `type`
   - `data.object`
4. inserts into `webhook_events`
5. deduplicates on `(provider, external_event_id)`
6. returns:
   - `202` when newly stored
   - `200` when duplicate

Current table used:
- `webhook_events(provider, external_event_id, event_type, processed_at, payload, created_at)`

That gives a safe first step:
- receive event
- preserve raw payload
- avoid duplicate writes
- defer processing until real billing logic exists

## Suggested processing phases

### Phase 1 — storage only
- done now
- goal: capture events safely and idempotently

### Phase 2 — signature verification
- verify `stripe-signature` against `STRIPE_WEBHOOK_SECRET`
- reject unverifiable events before insertion, or store-and-flag if you prefer audit-first behavior
- if using Fastify, you will likely want access to the raw request body for exact Stripe signature verification

### Phase 3 — projection into local billing state
Handle at least:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Projection targets:
- `customers.stripe_customer_id`
- `subscriptions.stripe_subscription_id`
- `subscriptions.stripe_price_id`
- `subscriptions.status`
- `subscriptions.billing_period_start`
- `subscriptions.billing_period_end`
- `subscriptions.cancel_at_period_end`
- `subscriptions.monthly_quota`
- `subscriptions.rpm_limit`

### Phase 4 — entitlements / quota sync
- plan lookup by Stripe price ID
- update quota/rate-limit settings from the internal plan map
- keep `usage_counters` independent from Stripe event history

## Minimal local testing

Enable storage mode in an uncommitted env file:

```bash
BILLING_WEBHOOK_STORAGE_ENABLED=true
DATABASE_URL=postgresql://company_data:company_data_dev@localhost:55432/company_data_dev
```

Example request:

```bash
curl -X POST http://localhost:3000/v1/billing/webhooks/stripe \
  -H 'content-type: application/json' \
  -d '{
    "id": "evt_local_test_001",
    "type": "customer.subscription.updated",
    "data": {
      "object": {
        "id": "sub_local_001",
        "customer": "cus_local_001",
        "status": "active"
      }
    }
  }'
```

This test only proves event storage/deduplication. It does **not** prove Stripe verification or subscription sync.
