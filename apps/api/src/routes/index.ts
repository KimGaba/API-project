import type { FastifyInstance } from 'fastify';
import { adminOverviewRoutes } from './admin-overview.js';
import { adminStatusRoutes } from './admin-status.js';
import { authRoutes } from './auth.js';
import { billingRoutes } from './billing.js';
import { companyRoutes } from './companies.js';
import { healthRoutes } from './health.js';
import { keysRoutes } from './keys.js';
import { metaRoutes } from './meta.js';

export async function registerRoutes(app: FastifyInstance) {
  await healthRoutes(app);
  await authRoutes(app);
  await metaRoutes(app);
  await companyRoutes(app);
  await billingRoutes(app);
  await keysRoutes(app);
  await adminStatusRoutes(app);
  await adminOverviewRoutes(app);
}
