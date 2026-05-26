import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  ALLOWED_CONFIG_KEYS,
  CONFIG_GROUPS,
  getConfigEntries,
  setConfigValues,
} from '../services/config-service.js';

const allKeys = [...ALLOWED_CONFIG_KEYS];

const setSchema = z.record(z.string(), z.string());

export async function adminConfigRoutes(app: FastifyInstance) {
  app.get('/v1/admin/config', async () => {
    const entries = await getConfigEntries(allKeys);
    const entryMap = Object.fromEntries(entries.map(e => [e.key, e]));
    return {
      data: {
        groups: CONFIG_GROUPS.map(g => ({
          ...g,
          keys: g.keys.map(k => ({ ...k, ...entryMap[k.key] })),
        })),
      },
    };
  });

  app.post('/v1/admin/config', async (request, reply) => {
    const parsed = setSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'BAD_REQUEST', details: parsed.error.flatten() });
    }

    // Filter to allowed keys only
    const allowed = Object.fromEntries(
      Object.entries(parsed.data).filter(([k]) => ALLOWED_CONFIG_KEYS.has(k))
    );

    await setConfigValues(allowed);
    return reply.send({ ok: true, updated: Object.keys(allowed) });
  });
}
