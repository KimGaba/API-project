import type { FastifyRequest } from 'fastify';
import { SESSION_COOKIE_NAME } from '../lib/auth.js';
import { getSessionByRawToken, revokeSessionByRawToken, touchSession } from '../services/session-service.js';
import { getUserById, toSafeAuthUser } from '../services/user-service.js';

export async function attachAuthSession(request: FastifyRequest) {
  const rawToken = request.cookies[SESSION_COOKIE_NAME];
  if (!rawToken) {
    request.authSession = null;
    request.currentUser = null;
    return;
  }

  const session = await getSessionByRawToken(rawToken);
  if (!session) {
    request.authSession = null;
    request.currentUser = null;
    return;
  }

  const user = await getUserById(session.userId);
  if (!user) {
    await revokeSessionByRawToken(rawToken);
    request.authSession = null;
    request.currentUser = null;
    return;
  }

  request.authSession = session;
  request.currentUser = toSafeAuthUser(user);

  void touchSession(session.id).catch((error) => {
    request.log.warn({ err: error, sessionId: session.id }, 'Failed to touch auth session');
  });
}
