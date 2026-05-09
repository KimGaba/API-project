import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireApiKey } from '../middleware/api-key.js';
import { searchCompanies } from '../services/company-service.js';

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  country: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export async function companyRoutes(app: FastifyInstance) {
  app.get('/v1/companies/search', { preHandler: requireApiKey }, async (request, reply) => {
    const parsed = searchQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'BAD_REQUEST',
        message: 'Invalid search query',
        details: parsed.error.flatten()
      });
    }

    const { q, country, limit } = parsed.data;
    const data = await searchCompanies({ q, country, limit });
    const ingestedCount = data.filter((company) => company.recordOrigin === 'ingested').length;
    const seededCount = data.length - ingestedCount;

    return {
      data,
      meta: {
        query: q ?? null,
        country: country ?? null,
        limit,
        total: data.length,
        placeholder: false,
        ingestedCount,
        seededCount,
        sampleNote: ingestedCount > 0
          ? 'Results include live-ingested source-backed rows currently stored in the local MVP database.'
          : 'No ingested source-backed rows matched this search; results may be seeded demo records only.'
      }
    };
  });
}
