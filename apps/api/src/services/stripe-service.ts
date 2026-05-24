import Stripe from 'stripe';
import { getBillingPlan } from '../config/billing.js';
import type { BillingPlanCode } from '../config/billing.js';
import { env } from '../config/env.js';

function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
}

export async function createCheckoutSession(input: {
  customerId: string;
  customerEmail: string;
  stripeCustomerId: string | null;
  planCode: BillingPlanCode;
  period: 'monthly' | 'yearly';
}): Promise<string> {
  const stripe = getStripe();
  const plan = getBillingPlan(input.planCode);

  if (!plan) throw new Error(`Unknown plan: ${input.planCode}`);
  if (input.planCode === 'free') throw new Error('Cannot checkout to free plan');
  if (input.planCode === 'enterprise') throw new Error('Enterprise plans require manual provisioning — contact us');

  const priceEnvKey = input.period === 'yearly'
    ? plan.stripeYearlyPriceEnvKey
    : plan.stripeMonthlyPriceEnvKey;

  if (!priceEnvKey) throw new Error(`No price configured for ${input.planCode} ${input.period}`);

  const priceId = process.env[priceEnvKey];
  if (!priceId) throw new Error(`Environment variable ${priceEnvKey} is not set`);

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.DASHBOARD_BASE_URL}/billing?session_id={CHECKOUT_SESSION_ID}&plan=${input.planCode}`,
    cancel_url: `${env.DASHBOARD_BASE_URL}/billing`,
    metadata: {
      customerId: input.customerId,
      planCode: input.planCode,
      period: input.period,
    },
  };

  if (input.stripeCustomerId) {
    params.customer = input.stripeCustomerId;
  } else {
    params.customer_email = input.customerEmail;
  }

  const session = await stripe.checkout.sessions.create(params);
  if (!session.url) throw new Error('Stripe did not return a checkout URL');
  return session.url;
}

export async function createPortalSession(stripeCustomerId: string): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${env.DASHBOARD_BASE_URL}/billing`,
  });
  return session.url;
}

export async function constructWebhookEvent(
  rawBody: Buffer,
  signature: string,
): Promise<Stripe.Event> {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}
