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

export type ManagedApiKey = {
  id: string;
  label: string | null;
  keyPrefix: string;
  active: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

export async function listKeysForCustomer(customerId: string): Promise<ManagedApiKey[]> {
  const result = await dbQuery(
    `SELECT id::text, label, key_prefix AS "keyPrefix", active, last_used_at AS "lastUsedAt", created_at AS "createdAt"
     FROM api_keys
     WHERE customer_id = $1::uuid AND revoked_at IS NULL
     ORDER BY created_at DESC`,
    [customerId]
  );
  return result.rows.map((r) => ({
    id: String(r.id),
    label: r.label ? String(r.label) : null,
    keyPrefix: String(r.keyPrefix ?? r.key_prefix),
    active: Boolean(r.active),
    lastUsedAt: r.lastUsedAt ? String(r.lastUsedAt) : null,
    createdAt: String(r.createdAt ?? r.created_at),
  }));
}

export async function createApiKey(input: {
  customerId: string;
  label?: string | null;
}): Promise<{ key: ManagedApiKey; rawKey: string }> {
  const raw = `cdapi_live_${crypto.randomBytes(28).toString('base64url')}`;
  const prefix = raw.slice(0, 20);
  const hash = hashApiKey(raw);

  const result = await dbQuery(
    `INSERT INTO api_keys (customer_id, key_prefix, key_hash, label, active)
     VALUES ($1::uuid, $2, $3, $4, TRUE)
     RETURNING id::text, label, key_prefix AS "keyPrefix", active, last_used_at AS "lastUsedAt", created_at AS "createdAt"`,
    [input.customerId, prefix, hash, input.label?.trim() || null]
  );

  const row = result.rows[0];
  if (!row) throw new Error('Failed to create API key');
  return {
    rawKey: raw,
    key: {
      id: String(row.id),
      label: row.label ? String(row.label) : null,
      keyPrefix: String(row['keyPrefix'] ?? row['key_prefix']),
      active: Boolean(row.active),
      lastUsedAt: null,
      createdAt: String(row['createdAt'] ?? row['created_at']),
    },
  };
}

export async function revokeApiKey(keyId: string, customerId: string): Promise<boolean> {
  const result = await dbQuery(
    `UPDATE api_keys
     SET active = FALSE, revoked_at = NOW()
     WHERE id = $1::uuid AND customer_id = $2::uuid AND revoked_at IS NULL`,
    [keyId, customerId]
  );
  return (result.rowCount ?? 0) > 0;
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
