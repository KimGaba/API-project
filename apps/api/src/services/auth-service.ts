import { hashPassword, verifyPassword } from './password-service.js';
import { createUserSession } from './session-service.js';
import { ensureCustomerForUser } from './customer-service.js';
import { createEmailUser, createOAuthUser, getUserByNormalizedEmail, toSafeAuthUser, updateLastLoginAt } from './user-service.js';
import { query } from '../lib/db.js';

export async function signupWithEmail(input: {
  email: string;
  password: string;
  displayName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existingUser = await getUserByNormalizedEmail(input.email);
  if (existingUser) {
    throw new Error('An account with that email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createEmailUser({
    email: input.email,
    passwordHash,
    displayName: input.displayName
  });

  await ensureCustomerForUser({
    userId: user.id,
    email: user.email,
    displayName: input.displayName,
  });

  const { rawToken, session } = await createUserSession({
    userId: user.id,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent
  });

  return {
    rawToken,
    session,
    user: toSafeAuthUser(user)
  };
}

export async function loginWithEmail(input: {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const user = await getUserByNormalizedEmail(input.email);
  if (!user?.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const passwordOk = await verifyPassword(user.passwordHash, input.password);
  if (!passwordOk) {
    throw new Error('Invalid email or password');
  }

  await updateLastLoginAt(user.id);

  const { rawToken, session } = await createUserSession({
    userId: user.id,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent
  });

  return {
    rawToken,
    session,
    user: toSafeAuthUser({
      ...user,
      lastLoginAt: new Date().toISOString()
    })
  };
}

export async function loginWithOAuth(input: {
  provider: string;
  providerUserId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  // 1. Look for existing identity link
  const identityRes = await query<{ user_id: string }>(
    `SELECT user_id FROM auth_identities WHERE provider = $1 AND provider_user_id = $2 LIMIT 1`,
    [input.provider, input.providerUserId]
  );

  let userId: string;

  if (identityRes.rows[0]) {
    userId = identityRes.rows[0].user_id;
    await updateLastLoginAt(userId);
  } else {
    // 2. Look for an existing user with same email
    const existingUser = await getUserByNormalizedEmail(input.email);

    if (existingUser) {
      userId = existingUser.id;
      await updateLastLoginAt(userId);
    } else {
      // 3. Create new user
      const newUser = await createOAuthUser({
        email: input.email,
        displayName: input.name,
        avatarUrl: input.avatarUrl,
      });
      userId = newUser.id;
    }

    // Link this OAuth identity
    await query(
      `INSERT INTO auth_identities (user_id, provider, provider_user_id, provider_email)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (provider, provider_user_id) DO NOTHING`,
      [userId, input.provider, input.providerUserId, input.email]
    );

    // Ensure customer record exists
    await ensureCustomerForUser({ userId, email: input.email, displayName: input.name });
  }

  const { rawToken, session } = await createUserSession({
    userId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  const userRes = await query<{ id: string; email: string; display_name: string | null; avatar_url: string | null; email_verified_at: string | null; status: string; last_login_at: string | null; created_at: string }>(
    `SELECT id, email, display_name, avatar_url, email_verified_at, status, last_login_at, created_at FROM users WHERE id = $1`,
    [userId]
  );
  const user = userRes.rows[0];
  if (!user) throw new Error('User not found after OAuth login');

  return {
    rawToken,
    session,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      emailVerified: Boolean(user.email_verified_at),
      status: user.status,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
    },
  };
}
