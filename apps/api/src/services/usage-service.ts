import type { FastifyRequest } from 'fastify';
import { query as dbQuery } from '../lib/db.js';

function getPeriodBounds(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const periodStart = new Date(Date.UTC(year, month, 1));
  const periodEnd = new Date(Date.UTC(year, month + 1, 1));

  return {
    periodMonth: periodStart.toISOString().slice(0, 10),
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10)
  };
}

export async function recordUsageFromRequest(request: FastifyRequest, statusCode: number) {
  const auth = request.apiAuth;

  if (!auth || auth.source !== 'db' || !auth.customerId) {
    return;
  }

  const { periodMonth, periodStart, periodEnd } = getPeriodBounds();
  const endpoint = request.routeOptions.url || request.url;
  const responseTimeMs = Math.max(0, Date.now() - (request.requestStartMs ?? Date.now()));
  const usageCategory = auth.usageCategory;

  await dbQuery(
    `
      INSERT INTO usage_events (
        customer_id,
        api_key_id,
        endpoint,
        request_count,
        period_month,
        status_code,
        response_time_ms
      )
      VALUES ($1::uuid, $2::uuid, $3, 1, $4::date, $5, $6)
    `,
    [auth.customerId, auth.apiKeyId, endpoint, periodMonth, statusCode, responseTimeMs]
  );

  await dbQuery(
    `
      INSERT INTO usage_counters (
        customer_id,
        api_key_id,
        period_start,
        period_end,
        total_requests,
        search_requests,
        lookup_requests,
        changes_requests
      )
      VALUES (
        $1::uuid,
        $2::uuid,
        $3::date,
        $4::date,
        1,
        CASE WHEN $5 = 'search' THEN 1 ELSE 0 END,
        CASE WHEN $5 = 'lookup' THEN 1 ELSE 0 END,
        CASE WHEN $5 = 'changes' THEN 1 ELSE 0 END
      )
      ON CONFLICT (customer_id, api_key_id, period_start, period_end)
      DO UPDATE SET
        total_requests = usage_counters.total_requests + 1,
        search_requests = usage_counters.search_requests + CASE WHEN $5 = 'search' THEN 1 ELSE 0 END,
        lookup_requests = usage_counters.lookup_requests + CASE WHEN $5 = 'lookup' THEN 1 ELSE 0 END,
        changes_requests = usage_counters.changes_requests + CASE WHEN $5 = 'changes' THEN 1 ELSE 0 END,
        updated_at = NOW()
    `,
    [auth.customerId, auth.apiKeyId, periodStart, periodEnd, usageCategory]
  );
}
