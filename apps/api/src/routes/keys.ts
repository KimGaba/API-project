import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireSession } from '../middleware/require-session.js';
import { createApiKey, listKeysForCustomer, revokeApiKey } from '../services/api-key-service.js';
import { getCustomerByUserId } from '../services/customer-service.js';

const createKeySchema = z.object({
  label: z.string().trim().max(80).optional().nullable()
});

async function resolveCustomer(request: Parameters<typeof requireSession>[0], reply: Parameters<typeof requireSession>[1]) {
  const user = request.currentUser!;
  const customer = await getCustomerByUserId(user.id);
  if (!customer) {
    return reply.code(403).send({ error: 'NO_CUSTOMER', message: 'No customer account found for this user.' });
  }
  return customer;
}

export async function keysRoutes(app: FastifyInstance) {
  app.get('/v1/keys', { preHandler: requireSession }, async (request, reply) => {
    const customer = await resolveCustomer(request, reply);
    if (!customer) return;
    const keys = await listKeysForCustomer(customer.id);
    return { data: keys };
  });

  app.post('/v1/keys', { preHandler: requireSession }, async (request, reply) => {
    const customer = await resolveCustomer(request, reply);
    if (!customer) return;

    const parsed = createKeySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'BAD_REQUEST', details: parsed.error.flatten() });
    }

    const { key, rawKey } = await createApiKey({
      customerId: customer.id,
      label: parsed.data.label,
    });

    return reply.code(201).send({ data: key, rawKey });
  });

  app.delete('/v1/keys/:id', { preHandler: requireSession }, async (request, reply) => {
    const customer = await resolveCustomer(request, reply);
    if (!customer) return;

    const { id } = request.params as { id: string };
    const revoked = await revokeApiKey(id, customer.id);

    if (!revoked) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Key not found or already revoked.' });
    }

    return { ok: true };
  });
}
