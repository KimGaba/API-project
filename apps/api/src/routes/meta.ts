import type { FastifyInstance } from 'fastify';
import { countries } from '../lib/countries.js';
import { requireApiKey } from '../middleware/api-key.js';

export async function metaRoutes(app: FastifyInstance) {
  app.get('/v1/meta/countries', { preHandler: requireApiKey }, async () => ({
    data: countries,
    meta: {
      total: countries.length
    }
  }));
}
