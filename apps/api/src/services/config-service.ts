import { query } from '../lib/db.js';

type ConfigSource = 'db' | 'env' | 'unset';

export type ConfigEntry = {
  key: string;
  masked: string | null;   // last 6 chars visible, rest masked — null if unset
  source: ConfigSource;
  isSet: boolean;
};

const SECRET_KEYS = new Set([
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GITHUB_CLIENT_SECRET',
  'GOOGLE_CLIENT_SECRET',
]);

function maskValue(key: string, value: string): string {
  if (SECRET_KEYS.has(key)) {
    return value.length > 6 ? `${'•'.repeat(Math.min(value.length - 6, 24))}${value.slice(-6)}` : '••••••';
  }
  // Non-secret: show last 12 chars
  return value.length > 12 ? `${'•'.repeat(6)}${value.slice(-12)}` : value;
}

export async function getConfigValue(key: string): Promise<string | null> {
  try {
    const result = await query<{ value: string }>('SELECT value FROM system_config WHERE key = $1', [key]);
    if (result.rows[0]) return result.rows[0].value;
  } catch {}
  return process.env[key] ?? null;
}

export async function setConfigValues(entries: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(entries)) {
    if (!ALLOWED_CONFIG_KEYS.has(key)) continue;
    if (value === '') {
      await query('DELETE FROM system_config WHERE key = $1', [key]);
    } else {
      await query(
        `INSERT INTO system_config (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
    }
  }
}

export async function getConfigEntries(keys: string[]): Promise<ConfigEntry[]> {
  const dbRows = await query<{ key: string; value: string }>(
    `SELECT key, value FROM system_config WHERE key = ANY($1)`,
    [keys]
  ).catch(() => ({ rows: [] as { key: string; value: string }[] }));

  const dbMap = new Map(dbRows.rows.map(r => [r.key, r.value]));

  return keys.map(key => {
    const dbVal = dbMap.get(key);
    if (dbVal !== undefined) {
      return { key, masked: maskValue(key, dbVal), source: 'db' as ConfigSource, isSet: true };
    }
    const envVal = process.env[key];
    if (envVal) {
      return { key, masked: maskValue(key, envVal), source: 'env' as ConfigSource, isSet: true };
    }
    return { key, masked: null, source: 'unset' as ConfigSource, isSet: false };
  });
}

export const ALLOWED_CONFIG_KEYS = new Set([
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRODUCT_STARTER_ID',
  'STRIPE_PRICE_STARTER_MONTHLY_ID',
  'STRIPE_PRICE_STARTER_YEARLY_ID',
  'STRIPE_PRODUCT_GROWTH_ID',
  'STRIPE_PRICE_GROWTH_MONTHLY_ID',
  'STRIPE_PRICE_GROWTH_YEARLY_ID',
  'STRIPE_PRODUCT_ENTERPRISE_ID',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]);

export const CONFIG_GROUPS = [
  {
    id: 'stripe',
    label: 'Stripe',
    description: 'Payment processing — find these in your Stripe Dashboard under Developers → API keys',
    keys: [
      { key: 'STRIPE_PUBLISHABLE_KEY',          label: 'Publishable key',             hint: 'pk_live_…',      secret: false },
      { key: 'STRIPE_SECRET_KEY',               label: 'Secret key',                  hint: 'sk_live_…',      secret: true  },
      { key: 'STRIPE_WEBHOOK_SECRET',           label: 'Webhook signing secret',      hint: 'whsec_…',        secret: true  },
      { key: 'STRIPE_PRODUCT_STARTER_ID',       label: 'Starter product ID',          hint: 'prod_…',         secret: false },
      { key: 'STRIPE_PRICE_STARTER_MONTHLY_ID', label: 'Starter monthly price',       hint: 'price_…',        secret: false },
      { key: 'STRIPE_PRICE_STARTER_YEARLY_ID',  label: 'Starter yearly price',        hint: 'price_…',        secret: false },
      { key: 'STRIPE_PRODUCT_GROWTH_ID',        label: 'Growth product ID',           hint: 'prod_…',         secret: false },
      { key: 'STRIPE_PRICE_GROWTH_MONTHLY_ID',  label: 'Growth monthly price',        hint: 'price_…',        secret: false },
      { key: 'STRIPE_PRICE_GROWTH_YEARLY_ID',   label: 'Growth yearly price',         hint: 'price_…',        secret: false },
      { key: 'STRIPE_PRODUCT_ENTERPRISE_ID',    label: 'Enterprise product ID',       hint: 'prod_…',         secret: false },
    ],
  },
  {
    id: 'github',
    label: 'GitHub OAuth',
    description: 'Create an OAuth App at github.com/settings/developers — callback URL: /auth/callback/github',
    keys: [
      { key: 'GITHUB_CLIENT_ID',     label: 'Client ID',     hint: 'Ov23li…', secret: false },
      { key: 'GITHUB_CLIENT_SECRET', label: 'Client secret', hint: '…',       secret: true  },
    ],
  },
  {
    id: 'google',
    label: 'Google OAuth',
    description: 'Create credentials at console.cloud.google.com — Authorised redirect: /auth/callback/google',
    keys: [
      { key: 'GOOGLE_CLIENT_ID',     label: 'Client ID',     hint: '…apps.googleusercontent.com', secret: false },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Client secret', hint: 'GOCSPX-…',                    secret: true  },
    ],
  },
];
