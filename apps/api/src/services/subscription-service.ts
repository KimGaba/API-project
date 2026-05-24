import { getBillingPlan } from '../config/billing.js';
import type { BillingPlanCode } from '../config/billing.js';
import { query } from '../lib/db.js';

export type Subscription = {
  id: string;
  planName: string;
  status: string;
  stripeSubscriptionId: string | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  monthlyQuota: number;
  rpmLimit: number;
  cancelAtPeriodEnd: boolean;
};

export async function getActiveSubscription(customerId: string): Promise<Subscription | null> {
  const result = await query(
    `SELECT id::text, plan_name AS "planName", status::text, stripe_subscription_id AS "stripeSubscriptionId",
            billing_period_start AS "billingPeriodStart", billing_period_end AS "billingPeriodEnd",
            monthly_quota AS "monthlyQuota", rpm_limit AS "rpmLimit",
            cancel_at_period_end AS "cancelAtPeriodEnd"
     FROM subscriptions
     WHERE customer_id = $1::uuid AND status IN ('active', 'trialing', 'past_due')
     ORDER BY created_at DESC LIMIT 1`,
    [customerId]
  );
  return (result.rows[0] as Subscription | undefined) ?? null;
}

export async function upsertSubscription(input: {
  customerId: string;
  planCode: BillingPlanCode;
  status: string;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  const plan = getBillingPlan(input.planCode);
  if (!plan) throw new Error(`Unknown plan: ${input.planCode}`);

  await query(
    `INSERT INTO subscriptions (
       customer_id, plan_name, status, stripe_subscription_id, stripe_price_id,
       billing_period_start, billing_period_end, cancel_at_period_end,
       monthly_quota, rpm_limit
     ) VALUES (
       $1::uuid, $2::plan_name, $3::subscription_status, $4, $5,
       $6, $7, $8,
       $9, $10
     )
     ON CONFLICT (stripe_subscription_id) DO UPDATE
     SET plan_name             = EXCLUDED.plan_name,
         status                = EXCLUDED.status,
         billing_period_start  = COALESCE(EXCLUDED.billing_period_start, subscriptions.billing_period_start),
         billing_period_end    = COALESCE(EXCLUDED.billing_period_end, subscriptions.billing_period_end),
         cancel_at_period_end  = EXCLUDED.cancel_at_period_end,
         monthly_quota         = EXCLUDED.monthly_quota,
         rpm_limit             = EXCLUDED.rpm_limit,
         updated_at            = NOW()`,
    [
      input.customerId,
      input.planCode,
      input.status,
      input.stripeSubscriptionId ?? null,
      input.stripePriceId ?? null,
      input.periodStart ?? null,
      input.periodEnd ?? null,
      input.cancelAtPeriodEnd ?? false,
      plan.monthlyQuota,
      plan.rpmLimit,
    ]
  );

  // Keep customer.default_plan in sync
  await query(
    `UPDATE customers SET default_plan = $1::plan_name, updated_at = NOW() WHERE id = $2::uuid`,
    [input.planCode, input.customerId]
  );
}

export async function downgradeToFree(customerId: string): Promise<void> {
  await query(
    `UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
     WHERE customer_id = $1::uuid AND status NOT IN ('canceled')`,
    [customerId]
  );
  await query(
    `UPDATE customers SET default_plan = 'free', updated_at = NOW() WHERE id = $1::uuid`,
    [customerId]
  );
}
