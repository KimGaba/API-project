import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from '../lib/auth.js';
import { attachAuthSession } from '../middleware/auth-session.js';
import { loginWithEmail, loginWithOAuth, signupWithEmail } from '../services/auth-service.js';
import { buildGitHubAuthUrl, buildGoogleAuthUrl, exchangeGitHubCode, exchangeGoogleCode } from '../services/oauth-service.js';
import { revokeSessionByRawToken } from '../services/session-service.js';

const OAUTH_STATE_COOKIE = 'oauth_state';

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

  // OAuth: redirect to provider
  app.get('/auth/oauth/:provider', async (request, reply) => {
    const { provider } = request.params as { provider: string };
    if (!['github', 'google'].includes(provider)) {
      return reply.code(404).send({ error: 'UNKNOWN_PROVIDER' });
    }

    const state = randomBytes(16).toString('hex');
    const callbackUrl = `${env.API_PUBLIC_URL}/auth/callback/${provider}`;

    const authUrl = provider === 'github'
      ? await buildGitHubAuthUrl(state, callbackUrl)
      : await buildGoogleAuthUrl(state, callbackUrl);

    if (!authUrl) {
      return reply.redirect(`${env.APP_BASE_URL}/login.html?error=oauth_not_configured`);
    }

    reply.setCookie(OAUTH_STATE_COOKIE, state, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: 600,
    });

    return reply.redirect(authUrl);
  });

  // OAuth: handle provider callback
  app.get('/auth/callback/:provider', async (request, reply) => {
    const { provider } = request.params as { provider: string };
    const { code, state, error } = request.query as { code?: string; state?: string; error?: string };

    const loginUrl = `${env.APP_BASE_URL}/login.html`;
    const dashboardUrl = env.DASHBOARD_BASE_URL;

    if (error || !code || !state) {
      return reply.redirect(`${loginUrl}?error=oauth_denied`);
    }

    const storedState = request.cookies[OAUTH_STATE_COOKIE];
    if (!storedState || storedState !== state) {
      return reply.redirect(`${loginUrl}?error=oauth_state`);
    }

    reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

    try {
      const callbackUrl = `${env.API_PUBLIC_URL}/auth/callback/${provider}`;
      const profile = provider === 'github'
        ? await exchangeGitHubCode(code, callbackUrl)
        : provider === 'google'
          ? await exchangeGoogleCode(code, callbackUrl)
          : null;

      if (!profile) return reply.redirect(`${loginUrl}?error=unknown_provider`);

      const result = await loginWithOAuth({
        provider,
        ...profile,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] ?? null,
      });

      reply.setCookie(SESSION_COOKIE_NAME, result.rawToken, getSessionCookieOptions());
      return reply.redirect(dashboardUrl);
    } catch (err) {
      request.log.warn({ err }, 'OAuth callback failed');
      const msg = err instanceof Error ? encodeURIComponent(err.message) : 'oauth_error';
      return reply.redirect(`${loginUrl}?error=${msg}`);
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
