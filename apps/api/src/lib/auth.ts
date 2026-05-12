import { createHash, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'cdp_session';

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string) {
  return createHash('sha256')
    .update(`${env.SESSION_SECRET}:${token}`)
    .digest('hex');
}

export function getSessionTtlMs() {
  return env.AUTH_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + getSessionTtlMs());
}

export function getSessionCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
    domain: env.COOKIE_DOMAIN || undefined,
    expires: getSessionExpiryDate()
  };
}
