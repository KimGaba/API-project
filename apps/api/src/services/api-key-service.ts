import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { query as dbQuery } from '../lib/db.js';

export type ApiKeyAuthContext = {
  source: 'db' | 'env';
  customerId: string | null;
  apiKeyId: string | null;
  keyPrefix: string | null;
};

type ApiKeyRecord = {
  apiKeyId: string;
  customerId: string;
  keyPrefix: string;
};

export function hashApiKey(apiKey: string) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export async function validateApiKey(apiKey: string): Promise<ApiKeyAuthContext | null> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return null;
  }

  if (process.env.DATABASE_URL) {
    const result = await dbQuery<ApiKeyRecord>(
      `
        SELECT
          ak.id::text AS "apiKeyId",
          ak.customer_id::text AS "customerId",
          ak.key_prefix AS "keyPrefix"
        FROM api_keys ak
        JOIN customers c ON c.id = ak.customer_id
        WHERE ak.key_hash = $1
          AND ak.active = TRUE
          AND ak.revoked_at IS NULL
          AND c.status = 'active'
        LIMIT 1
      `,
      [hashApiKey(trimmed)]
    );

    const row = result.rows[0];
    if (row) {
      return {
        source: 'db',
        customerId: row.customerId,
        apiKeyId: row.apiKeyId,
        keyPrefix: row.keyPrefix
      };
    }
  }

  if (env.apiKeys.includes(trimmed)) {
    return {
      source: 'env',
      customerId: null,
      apiKeyId: null,
      keyPrefix: trimmed.slice(0, 12)
    };
  }

  return null;
}

export function inferUsageCategory(pathname: string): 'search' | 'lookup' | 'changes' | 'other' {
  if (pathname.includes('/search')) {
    return 'search';
  }

  if (pathname.includes('/changes')) {
    return 'changes';
  }

  if (pathname.includes('/companies/')) {
    return 'lookup';
  }

  return 'other';
}
