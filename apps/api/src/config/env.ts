import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
  API_KEY_HEADER: z.string().default('x-api-key'),
  API_KEYS: z.string().default('demo_live_123'),
  DATABASE_URL: z.string().optional(),
  BILLING_PROVIDER: z.enum(['none', 'stripe']).default('stripe'),
  BILLING_WEBHOOK_STORAGE_ENABLED: z.coerce.boolean().default(false),
  STRIPE_PUBLISHABLE_KEY: z.string().default(''),
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_PRODUCT_STARTER_ID: z.string().default(''),
  STRIPE_PRICE_STARTER_MONTHLY_ID: z.string().default(''),
  STRIPE_PRICE_STARTER_YEARLY_ID: z.string().default(''),
  STRIPE_PRODUCT_GROWTH_ID: z.string().default(''),
  STRIPE_PRICE_GROWTH_MONTHLY_ID: z.string().default(''),
  STRIPE_PRICE_GROWTH_YEARLY_ID: z.string().default(''),
  STRIPE_PRODUCT_ENTERPRISE_ID: z.string().default('')
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  apiKeys: parsed.API_KEYS.split(',').map((key) => key.trim()).filter(Boolean)
};
