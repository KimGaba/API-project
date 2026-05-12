import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from '../lib/auth.js';
import { attachAuthSession } from '../middleware/auth-session.js';
import { loginWithEmail, signupWithEmail } from '../services/auth-service.js';
import { revokeSessionByRawToken } from '../services/session-service.js';

const signupSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(120).optional().nullable()
});

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128)
});

export async function authRoutes(app: FastifyInstance) {
  app.addHook('preHandler', attachAuthSession);

  app.get('/auth/me', async (request) => ({
    user: request.currentUser ?? null
  }));

  app.post('/auth/signup', async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'BAD_REQUEST',
        message: 'Invalid signup payload',
        details: parsed.error.flatten()
      });
    }

    try {
      const result = await signupWithEmail({
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.displayName ?? null,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] ?? null
      });

      reply.setCookie(SESSION_COOKIE_NAME, result.rawToken, getSessionCookieOptions());

      return reply.code(201).send({
        user: result.user
      });
    } catch (error) {
      request.log.warn({ err: error }, 'Signup failed');

      const message = error instanceof Error ? error.message : 'Signup failed';
      const statusCode = message.includes('already exists') ? 409 : 500;

      return reply.code(statusCode).send({
        error: statusCode === 409 ? 'ACCOUNT_EXISTS' : 'SIGNUP_FAILED',
        message
      });
    }
  });

  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'BAD_REQUEST',
        message: 'Invalid login payload',
        details: parsed.error.flatten()
      });
    }

    try {
      const result = await loginWithEmail({
        email: parsed.data.email,
        password: parsed.data.password,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] ?? null
      });

      reply.setCookie(SESSION_COOKIE_NAME, result.rawToken, getSessionCookieOptions());

      return reply.send({
        user: result.user
      });
    } catch (error) {
      request.log.warn({ err: error }, 'Login failed');

      return reply.code(401).send({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }
  });

  app.post('/auth/logout', async (request, reply) => {
    const rawToken = request.cookies[SESSION_COOKIE_NAME];

    if (rawToken) {
      await revokeSessionByRawToken(rawToken);
    }

    reply.clearCookie(SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      domain: env.COOKIE_DOMAIN || undefined
    });

    return reply.send({ ok: true });
  });
}
