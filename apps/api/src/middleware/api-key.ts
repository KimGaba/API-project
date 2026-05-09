import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { inferUsageCategory, validateApiKey } from '../services/api-key-service.js';

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
  const headerName = env.API_KEY_HEADER.toLowerCase();
  const apiKey = request.headers[headerName] ?? request.headers[env.API_KEY_HEADER];

  if (typeof apiKey !== 'string') {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: `Missing or invalid API key. Send ${env.API_KEY_HEADER} header.`
    });
  }

  const auth = await validateApiKey(apiKey);

  if (!auth) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: `Missing or invalid API key. Send ${env.API_KEY_HEADER} header.`
    });
  }

  request.apiAuth = {
    ...auth,
    usageCategory: inferUsageCategory(request.routeOptions.url || request.url)
  };

  request.log.debug(
    {
      keyHeader: env.API_KEY_HEADER,
      authSource: auth.source,
      apiKeyId: auth.apiKeyId,
      customerId: auth.customerId
    },
    'API key accepted'
  );
}
