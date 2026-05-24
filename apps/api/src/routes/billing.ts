import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { billingPlans, getBillingPlan } from '../config/billing.js';
import type { BillingPlanCode } from '../config/billing.js';
import { env } from '../config/env.js';
import { requireSession } from '../middleware/require-session.js';
import { getCustomerByUserId } from '../services/customer-service.js';
import { createCheckoutSession, createPortalSession, constructWebhookEvent } from '../services/stripe-service.js';
import { downgradeToFree, upsertSubscription } from '../services/subscription-service.js';
import { query } from '../lib/db.js';

const checkoutSchema = z.object({
  planCode: z.enum(['starter', 'growth', 'enterprise']),
  period: z.enum(['monthly', 'yearly']).default('monthly'),
});

export async function billingRoutes(app: FastifyInstance) {
  app.get('/v1/billing/plans', async () => ({
    data: billingPlans,
    meta: {
      mode: env.BILLING_PROVIDER,
      checkoutConfigured: env.STRIPE_SECRET_KEY.length > 0,
      webhookConfigured: env.STRIPE_WEBHOOK_SECRET.length > 0,
    },
  }));

  // Create Stripe checkout session — redirects user to Stripe-hosted payment page
  app.post('/v1/billing/checkout', { preHandler: requireSession }, async (request, reply) => {
    if (!env.STRIPE_SECRET_KEY) {
      return reply.code(503).send({
        error: 'BILLING_NOT_CONFIGURED',
        message: 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout.',
      });
    }

    const parsed = checkoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'BAD_REQUEST', details: parsed.error.flatten() });
    }

    const customer = await getCustomerByUserId(request.currentUser!.id);
    if (!customer) {
      return reply.code(403).send({ error: 'NO_CUSTOMER', message: 'No customer account found.' });
    }

    // Fetch stripe_customer_id from DB
    const row = await query(
      `SELECT stripe_customer_id FROM customers WHERE id = $1::uuid`,
      [customer.id]
    );
    const stripeCustomerId = (row.rows[0] as { stripe_customer_id: string | null } | undefined)?.stripe_customer_id ?? null;

    try {
      const checkoutUrl = await createCheckoutSession({
        customerId: customer.id,
        customerEmail: customer.email,
        stripeCustomerId,
        planCode: parsed.data.planCode as BillingPlanCode,
        period: parsed.data.period,
      });
      return reply.send({ checkoutUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      return reply.code(422).send({ error: 'CHECKOUT_FAILED', message: msg });
    }
  });

  // Stripe customer portal — manage billing info, cancel subscription
  app.post('/v1/billing/portal', { preHandler: requireSession }, async (request, reply) => {
    if (!env.STRIPE_SECRET_KEY) {
      return reply.code(503).send({ error: 'BILLING_NOT_CONFIGURED', message: 'Stripe is not configured.' });
    }

    const customer = await getCustomerByUserId(request.currentUser!.id);
    if (!customer) return reply.code(403).send({ error: 'NO_CUSTOMER' });

    const row = await query(
      `SELECT stripe_customer_id FROM customers WHERE id = $1::uuid`,
      [customer.id]
    );
    const stripeCustomerId = (row.rows[0] as { stripe_customer_id: string | null } | undefined)?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      return reply.code(422).send({ error: 'NO_STRIPE_CUSTOMER', message: 'No Stripe customer linked yet.' });
    }

    const portalUrl = await createPortalSession(stripeCustomerId);
    return reply.send({ portalUrl });
  });

  // Stripe webhook — processes payment events
  app.post('/v1/billing/webhooks/stripe', {
    config: { rawBody: true }  // need raw body for signature verification
  }, async (request, reply) => {
    const signature = request.headers['stripe-signature'];

    // If webhook secret is set, verify signature
    if (env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        const rawBody = (request as unknown as { rawBody: Buffer }).rawBody ?? Buffer.from(JSON.stringify(request.body));
        const event = await constructWebhookEvent(rawBody, String(signature));
        await processStripeEvent(event.type, event.data.object as unknown as Record<string, unknown>);
        return reply.send({ ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Webhook error';
        return reply.code(400).send({ error: 'WEBHOOK_ERROR', message: msg });
      }
    }

    // No signature verification (dev mode) — process raw JSON
    const body = request.body as { type?: string; data?: { object?: Record<string, unknown> } };
    if (body?.type && body?.data?.object) {
      await processStripeEvent(body.type, body.data.object).catch(() => null);
    }

    return reply.send({ ok: true, mode: 'unverified' });
  });
}

async function processStripeEvent(type: string, obj: Record<string, unknown>) {
  const meta = (obj['metadata'] as Record<string, string> | null) ?? {};

  switch (type) {
    case 'checkout.session.completed': {
      const customerId = meta['customerId'];
      const planCode = meta['planCode'] as BillingPlanCode | undefined;
      const period = meta['period'] as 'monthly' | 'yearly' | undefined;
      const subId = obj['subscription'] as string | null;

      if (customerId && planCode) {
        await upsertSubscription({
          customerId,
          planCode,
          status: 'active',
          stripeSubscriptionId: subId,
          cancelAtPeriodEnd: false,
        });

        // Store stripe_customer_id on the customer record
        const stripeCustomer = obj['customer'] as string | null;
        if (stripeCustomer) {
          await query(
            `UPDATE customers SET stripe_customer_id = $1, updated_at = NOW() WHERE id = $2::uuid`,
            [stripeCustomer, customerId]
          );
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subId = obj['id'] as string;
      const status = obj['status'] as string;
      const cancelAtEnd = Boolean(obj['cancel_at_period_end']);
      const stripeCustomer = obj['customer'] as string;

      // Find customer by stripe_customer_id
      const row = await query(
        `SELECT id::text, default_plan FROM customers WHERE stripe_customer_id = $1`,
        [stripeCustomer]
      );
      const customer = row.rows[0] as { id: string; default_plan: string } | undefined;
      if (!customer) break;

      await upsertSubscription({
        customerId: customer.id,
        planCode: (customer.default_plan as BillingPlanCode) || 'free',
        status,
        stripeSubscriptionId: subId,
        cancelAtPeriodEnd: cancelAtEnd,
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const stripeCustomer = obj['customer'] as string;
      const row = await query(
        `SELECT id::text FROM customers WHERE stripe_customer_id = $1`,
        [stripeCustomer]
      );
      const customer = row.rows[0] as { id: string } | undefined;
      if (customer) await downgradeToFree(customer.id);
      break;
    }
  }
}
