import type { FastifyReply, FastifyRequest } from 'fastify';
import { attachAuthSession } from './auth-session.js';

export async function requireSession(request: FastifyRequest, reply: FastifyReply) {
  await attachAuthSession(request);
  if (!request.currentUser) {
    return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Login required.' });
  }
}
