export type BillingPlanCode = 'free' | 'starter' | 'growth' | 'enterprise';

export type BillingPlanDefinition = {
  code: BillingPlanCode;
  displayName: string;
  monthlyQuota: number;
  rpmLimit: number;
  stripeProductEnvKey: string | null;
  stripeMonthlyPriceEnvKey: string | null;
  stripeYearlyPriceEnvKey: string | null;
  notes?: string;
};

export const billingPlans: BillingPlanDefinition[] = [
  {
    code: 'free',
    displayName: 'Free',
    monthlyQuota: 100,
    rpmLimit: 5,
    stripeProductEnvKey: null,
    stripeMonthlyPriceEnvKey: null,
    stripeYearlyPriceEnvKey: null,
    notes: 'Local/default plan. Keep outside Stripe unless self-serve free signup becomes real.'
  },
  {
    code: 'starter',
    displayName: 'Starter',
    monthlyQuota: 10_000,
    rpmLimit: 60,
    stripeProductEnvKey: 'STRIPE_PRODUCT_STARTER_ID',
    stripeMonthlyPriceEnvKey: 'STRIPE_PRICE_STARTER_MONTHLY_ID',
    stripeYearlyPriceEnvKey: 'STRIPE_PRICE_STARTER_YEARLY_ID'
  },
  {
    code: 'growth',
    displayName: 'Growth',
    monthlyQuota: 100_000,
    rpmLimit: 300,
    stripeProductEnvKey: 'STRIPE_PRODUCT_GROWTH_ID',
    stripeMonthlyPriceEnvKey: 'STRIPE_PRICE_GROWTH_MONTHLY_ID',
    stripeYearlyPriceEnvKey: 'STRIPE_PRICE_GROWTH_YEARLY_ID'
  },
  {
    code: 'enterprise',
    displayName: 'Enterprise',
    monthlyQuota: 0,
    rpmLimit: 0,
    stripeProductEnvKey: 'STRIPE_PRODUCT_ENTERPRISE_ID',
    stripeMonthlyPriceEnvKey: null,
    stripeYearlyPriceEnvKey: null,
    notes: 'Custom contract / manual provisioning for now.'
  }
];

export function getBillingPlan(code: BillingPlanCode) {
  return billingPlans.find((plan) => plan.code === code);
}
