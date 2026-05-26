import { query } from '../lib/db.js';
import { normalizeEmail } from '../lib/auth.js';

export type AuthUser = {
  id: string;
  email: string;
  emailNormalized: string;
  emailVerifiedAt: string | null;
  passwordHash: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapUser(row: {
  id: string;
  email: string;
  email_normalized: string;
  email_verified_at: string | null;
  password_hash: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}): AuthUser {
  return {
    id: row.id,
    email: row.email,
    emailNormalized: row.email_normalized,
    emailVerifiedAt: row.email_verified_at,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    status: row.status,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getUserByNormalizedEmail(email: string) {
  const result = await query<{
    id: string;
    email: string;
    email_normalized: string;
    email_verified_at: string | null;
    password_hash: string | null;
    display_name: string | null;
    avatar_url: string | null;
    status: string;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, email, email_normalized, email_verified_at, password_hash, display_name, avatar_url, status, last_login_at, created_at, updated_at
     FROM users
     WHERE email_normalized = $1
     LIMIT 1`,
    [normalizeEmail(email)]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function getUserById(id: string) {
  const result = await query<{
    id: string;
    email: string;
    email_normalized: string;
    email_verified_at: string | null;
    password_hash: string | null;
    display_name: string | null;
    avatar_url: string | null;
    status: string;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, email, email_normalized, email_verified_at, password_hash, display_name, avatar_url, status, last_login_at, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function createEmailUser(input: {
  email: string;
  passwordHash: string;
  displayName?: string | null;
}) {
  const normalizedEmail = normalizeEmail(input.email);

  const result = await query<{
    id: string;
    email: string;
    email_normalized: string;
    email_verified_at: string | null;
    password_hash: string | null;
    display_name: string | null;
    avatar_url: string | null;
    status: string;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `WITH inserted_user AS (
      INSERT INTO users (email, email_normalized, password_hash, display_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, email_normalized, email_verified_at, password_hash, display_name, avatar_url, status, last_login_at, created_at, updated_at
    ), inserted_identity AS (
      INSERT INTO auth_identities (user_id, provider, provider_user_id, provider_email)
      SELECT id, 'email', NULL, email FROM inserted_user
      RETURNING user_id
    )
    SELECT id, email, email_normalized, email_verified_at, password_hash, display_name, avatar_url, status, last_login_at, created_at, updated_at
    FROM inserted_user`,
    [input.email.trim(), normalizedEmail, input.passwordHash, input.displayName?.trim() || null]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('Failed to create email user');
  }

  return mapUser(row);
}

export async function createOAuthUser(input: {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const result = await query<{
    id: string; email: string; email_normalized: string; email_verified_at: string | null;
    password_hash: string | null; display_name: string | null; avatar_url: string | null;
    status: string; last_login_at: string | null; created_at: string; updated_at: string;
  }>(
    `INSERT INTO users (email, email_normalized, display_name, avatar_url, email_verified_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, email, email_normalized, email_verified_at, password_hash, display_name, avatar_url, status, last_login_at, created_at, updated_at`,
    [input.email.trim(), normalizedEmail, input.displayName?.trim() || null, input.avatarUrl || null]
  );
  const row = result.rows[0];
  if (!row) throw new Error('Failed to create OAuth user');
  return mapUser(row);
}

export async function updateLastLoginAt(userId: string) {
  await query(
    `UPDATE users
     SET last_login_at = NOW()
     WHERE id = $1`,
    [userId]
  );
}

export function toSafeAuthUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    emailVerified: Boolean(user.emailVerifiedAt),
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt
  };
}
