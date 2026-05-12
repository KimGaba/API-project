import { hashPassword, verifyPassword } from './password-service.js';
import { createUserSession } from './session-service.js';
import { createEmailUser, getUserByNormalizedEmail, toSafeAuthUser, updateLastLoginAt } from './user-service.js';

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
