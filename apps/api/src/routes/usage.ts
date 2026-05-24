import type { FastifyInstance } from 'fastify';
import { requireSession } from '../middleware/require-session.js';
import { getCustomerByUserId } from '../services/customer-service.js';
import { getActiveSubscription } from '../services/subscription-service.js';
import { query } from '../lib/db.js';

export async function usageRoutes(app: FastifyInstance) {
  app.get('/v1/usage', { preHandler: requireSession }, async (request, reply) => {
    const customer = await getCustomerByUserId(request.currentUser!.id);
    if (!customer) {
      return reply.code(404).send({ error: 'NO_CUSTOMER', message: 'No customer account found.' });
    }

    const subscription = await getActiveSubscription(customer.id);
    const quota = subscription?.monthlyQuota ?? 100;

    // Current period: first day of this month → first day of next month
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const periodEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);

    // Total requests this billing period
    const counterRes = await query<{ total: string }>(
      `SELECT COALESCE(SUM(total_requests), 0)::text AS total
       FROM usage_counters
       WHERE customer_id = $1::uuid AND period_start >= $2 AND period_end <= $3`,
      [customer.id, periodStart, periodEnd]
    );
    const requestsThisMonth = parseInt(counterRes.rows[0]?.total ?? '0', 10);

    // Daily breakdown for chart (last 30 days via usage_events)
    const dailyRes = await query<{ day: string; count: string }>(
      `SELECT DATE(created_at) AS day, SUM(request_count)::text AS count
       FROM usage_events
       WHERE customer_id = $1::uuid
         AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      [customer.id]
    );

    // Build a 30-day array with zeros for missing days
    const dailyMap: Record<string, number> = {};
    for (const row of dailyRes.rows) {
      dailyMap[row.day] = parseInt(row.count, 10);
    }
    const daily: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      daily.push({ date: key, count: dailyMap[key] ?? 0 });
    }

    // Requests by endpoint
    const endpointRes = await query<{ endpoint: string; count: string }>(
      `SELECT endpoint, SUM(request_count)::text AS count
       FROM usage_events
       WHERE customer_id = $1::uuid
         AND period_month >= $2
       GROUP BY endpoint
       ORDER BY SUM(request_count) DESC
       LIMIT 10`,
      [customer.id, periodStart]
    );

    return reply.send({
      data: {
        requestsThisMonth,
        quota,
        periodStart,
        periodEnd,
        daily,
        byEndpoint: endpointRes.rows.map(r => ({
          endpoint: r.endpoint,
          count: parseInt(r.count, 10),
        })),
      },
    });
  });
}
