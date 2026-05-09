import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { recordUsageFromRequest } from '../services/usage-service.js';

export async function registerBasePlugins(app: FastifyInstance) {
  await app.register(sensible);
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN
  });

  app.addHook('onRequest', async (request) => {
    request.requestStartMs = Date.now();
  });

  app.addHook('onResponse', async (request, reply) => {
    if (!request.apiAuth || request.apiAuth.usageLogged) {
      return;
    }

    request.apiAuth.usageLogged = true;

    try {
      await recordUsageFromRequest(request, reply.statusCode);
    } catch (error) {
      request.log.warn({ err: error }, 'Failed to record usage');
    }
  });
}
