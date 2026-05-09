import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { billingPlans } from '../config/billing.js';
import { env } from '../config/env.js';
import { storeWebhookEvent } from '../services/webhook-event-service.js';

const stripeWebhookBodySchema = z.object({
  id: z.string().trim().min(1),
  type: z.string().trim().min(1),
  data: z.object({
    object: z.unknown()
  }).passthrough()
}).passthrough();

export async function billingRoutes(app: FastifyInstance) {
  app.get('/v1/billing/plans', async () => ({
    data: billingPlans,
    meta: {
      mode: env.BILLING_PROVIDER,
      checkoutConfigured: env.STRIPE_SECRET_KEY.length > 0,
      webhookConfigured: env.STRIPE_WEBHOOK_SECRET.length > 0
    }
  }));

  app.post('/v1/billing/webhooks/stripe', async (request, reply) => {
    if (!env.BILLING_WEBHOOK_STORAGE_ENABLED) {
      return reply.code(503).send({
        error: 'BILLING_WEBHOOK_DISABLED',
        message: 'Stripe webhook storage scaffold is disabled in this environment.'
      });
    }

    if (!env.DATABASE_URL) {
      return reply.code(503).send({
        error: 'DATABASE_UNAVAILABLE',
        message: 'DATABASE_URL must be configured before storing webhook events.'
      });
    }

    const parsed = stripeWebhookBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'BAD_REQUEST',
        message: 'Expected a Stripe-like webhook JSON payload with id, type, and data.object.',
        details: parsed.error.flatten()
      });
    }

    const result = await storeWebhookEvent({
      provider: 'stripe',
      externalEventId: parsed.data.id,
      eventType: parsed.data.type,
      payload: parsed.data
    });

    return reply.code(result.inserted ? 202 : 200).send({
      ok: true,
      stored: result.inserted,
      duplicate: !result.inserted,
      verification: 'not yet implemented',
      nextStep: 'attach Stripe signature verification and subscription-state processing before production use'
    });
  });
}
