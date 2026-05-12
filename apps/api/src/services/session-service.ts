import { query } from '../lib/db.js';
import { createSessionToken, getSessionExpiryDate, hashSessionToken } from '../lib/auth.js';

export type AuthSession = {
  id: string;
  userId: string;
  customerId: string | null;
  sessionTokenHash: string;
  expiresAt: string;
  lastSeenAt: string;
};

export async function createUserSession(input: {
  userId: string;
  customerId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const rawToken = createSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = getSessionExpiryDate();

  const result = await query<{
    id: string;
    user_id: string;
    customer_id: string | null;
    session_token_hash: string;
    expires_at: string;
    last_seen_at: string;
  }>(
    `INSERT INTO user_sessions (
      user_id,
      customer_id,
      session_token_hash,
      expires_at,
      ip_address,
      user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, customer_id, session_token_hash, expires_at, last_seen_at`,
    [
      input.userId,
      input.customerId ?? null,
      tokenHash,
      expiresAt.toISOString(),
      input.ipAddress ?? null,
      input.userAgent ?? null
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('Failed to create user session');
  }

  return {
    rawToken,
    session: {
      id: row.id,
      userId: row.user_id,
      customerId: row.customer_id,
      sessionTokenHash: row.session_token_hash,
      expiresAt: row.expires_at,
      lastSeenAt: row.last_seen_at
    } satisfies AuthSession
  };
}

export async function getSessionByRawToken(rawToken: string) {
  const tokenHash = hashSessionToken(rawToken);

  const result = await query<{
    id: string;
    user_id: string;
    customer_id: string | null;
    session_token_hash: string;
    expires_at: string;
    last_seen_at: string;
  }>(
    `SELECT id, user_id, customer_id, session_token_hash, expires_at, last_seen_at
     FROM user_sessions
     WHERE session_token_hash = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    customerId: row.customer_id,
    sessionTokenHash: row.session_token_hash,
    expiresAt: row.expires_at,
    lastSeenAt: row.last_seen_at
  } satisfies AuthSession;
}

export async function revokeSessionByRawToken(rawToken: string) {
  const tokenHash = hashSessionToken(rawToken);

  await query(
    `UPDATE user_sessions
     SET revoked_at = NOW(), last_seen_at = NOW()
     WHERE session_token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash]
  );
}

export async function touchSession(sessionId: string) {
  await query(
    `UPDATE user_sessions
     SET last_seen_at = NOW()
     WHERE id = $1`,
    [sessionId]
  );
}
