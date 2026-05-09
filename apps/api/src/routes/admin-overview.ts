import type { FastifyInstance } from 'fastify';
import { query } from '../lib/db.js';

type CustomerRow = {
  id: string;
  email: string;
  name: string | null;
  company_name: string | null;
  country_code: string | null;
  default_plan: string;
  status: string;
  active_subscription_plan: string | null;
  active_subscription_status: string | null;
  monthly_quota: number | null;
  rpm_limit: number | null;
  active_api_keys: string;
  last_api_key_used_at: string | null;
  current_period_total_requests: string;
};

type UsageOverviewRow = {
  active_customers: string;
  active_api_keys: string;
  current_period_total_requests: string;
  current_period_search_requests: string;
  current_period_lookup_requests: string;
  current_period_changes_requests: string;
  usage_event_count: string;
  latest_usage_at: string | null;
};

type DatabaseOverviewRow = {
  company_count: string;
  ingested_company_count: string;
  seeded_company_count: string;
  address_count: string;
  activity_count: string;
  source_record_count: string;
  latest_company_source_at: string | null;
};

function getPeriodStartDate(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

export async function adminOverviewRoutes(app: FastifyInstance) {
  app.get('/v1/admin/overview', async () => {
    if (!process.env.DATABASE_URL) {
      return {
        data: {
          customers: [],
          usageOverview: null,
          databaseOverview: null
        },
        meta: {
          generatedAt: new Date().toISOString(),
          dataAvailable: false,
          fallbackReason: 'DATABASE_URL is not configured for the API process.'
        }
      };
    }

    const periodStart = getPeriodStartDate();

    const [customersResult, usageOverviewResult, databaseOverviewResult] = await Promise.all([
      query<CustomerRow>(`
        SELECT
          c.id::text AS id,
          c.email,
          c.name,
          c.company_name,
          c.country_code,
          c.default_plan::text AS default_plan,
          c.status,
          s.plan_name::text AS active_subscription_plan,
          s.status::text AS active_subscription_status,
          s.monthly_quota,
          s.rpm_limit,
          COUNT(DISTINCT ak.id) FILTER (WHERE ak.active = TRUE AND ak.revoked_at IS NULL)::text AS active_api_keys,
          MAX(ak.last_used_at) AS last_api_key_used_at,
          COALESCE(SUM(uc.total_requests), 0)::text AS current_period_total_requests
        FROM customers c
        LEFT JOIN LATERAL (
          SELECT
            s1.plan_name,
            s1.status,
            s1.monthly_quota,
            s1.rpm_limit
          FROM subscriptions s1
          WHERE s1.customer_id = c.id
          ORDER BY
            CASE WHEN s1.status = 'active' THEN 0 ELSE 1 END,
            COALESCE(s1.billing_period_end, s1.updated_at, s1.created_at) DESC,
            s1.created_at DESC
          LIMIT 1
        ) s ON TRUE
        LEFT JOIN api_keys ak ON ak.customer_id = c.id
        LEFT JOIN usage_counters uc
          ON uc.customer_id = c.id
         AND uc.period_start = $1::date
        GROUP BY
          c.id,
          c.email,
          c.name,
          c.company_name,
          c.country_code,
          c.default_plan,
          c.status,
          s.plan_name,
          s.status,
          s.monthly_quota,
          s.rpm_limit
        ORDER BY current_period_total_requests::bigint DESC, c.created_at ASC
        LIMIT 12
      `, [periodStart]),
      query<UsageOverviewRow>(`
        SELECT
          COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active')::text AS active_customers,
          COUNT(DISTINCT ak.id) FILTER (WHERE ak.active = TRUE AND ak.revoked_at IS NULL)::text AS active_api_keys,
          COALESCE(SUM(uc.total_requests), 0)::text AS current_period_total_requests,
          COALESCE(SUM(uc.search_requests), 0)::text AS current_period_search_requests,
          COALESCE(SUM(uc.lookup_requests), 0)::text AS current_period_lookup_requests,
          COALESCE(SUM(uc.changes_requests), 0)::text AS current_period_changes_requests,
          COUNT(ue.id)::text AS usage_event_count,
          MAX(ue.created_at) AS latest_usage_at
        FROM customers c
        LEFT JOIN api_keys ak ON ak.customer_id = c.id
        LEFT JOIN usage_counters uc ON uc.customer_id = c.id AND uc.period_start = $1::date
        LEFT JOIN usage_events ue ON ue.customer_id = c.id AND ue.period_month = $1::date
      `, [periodStart]),
      query<DatabaseOverviewRow>(`
        SELECT
          COUNT(*)::text AS company_count,
          COUNT(*) FILTER (WHERE latest_source_id IS NOT NULL)::text AS ingested_company_count,
          COUNT(*) FILTER (WHERE latest_source_id IS NULL)::text AS seeded_company_count,
          (SELECT COUNT(*)::text FROM company_addresses) AS address_count,
          (SELECT COUNT(*)::text FROM company_activities) AS activity_count,
          (SELECT COUNT(*)::text FROM source_records) AS source_record_count,
          MAX(latest_source_record_at) AS latest_company_source_at
        FROM companies
      `)
    ]);

    const usageOverview = usageOverviewResult.rows[0] ?? null;
    const databaseOverview = databaseOverviewResult.rows[0] ?? null;

    return {
      data: {
        customers: customersResult.rows.map((row) => ({
          id: row.id,
          email: row.email,
          name: row.name,
          companyName: row.company_name,
          countryCode: row.country_code,
          defaultPlan: row.default_plan,
          status: row.status,
          subscription: row.active_subscription_plan
            ? {
                planName: row.active_subscription_plan,
                status: row.active_subscription_status,
                monthlyQuota: row.monthly_quota,
                rpmLimit: row.rpm_limit
              }
            : null,
          activeApiKeys: Number(row.active_api_keys),
          lastApiKeyUsedAt: row.last_api_key_used_at,
          currentPeriodTotalRequests: Number(row.current_period_total_requests)
        })),
        usageOverview: usageOverview
          ? {
              activeCustomers: Number(usageOverview.active_customers),
              activeApiKeys: Number(usageOverview.active_api_keys),
              currentPeriodTotalRequests: Number(usageOverview.current_period_total_requests),
              currentPeriodSearchRequests: Number(usageOverview.current_period_search_requests),
              currentPeriodLookupRequests: Number(usageOverview.current_period_lookup_requests),
              currentPeriodChangesRequests: Number(usageOverview.current_period_changes_requests),
              usageEventCount: Number(usageOverview.usage_event_count),
              latestUsageAt: usageOverview.latest_usage_at
            }
          : null,
        databaseOverview: databaseOverview
          ? {
              companyCount: Number(databaseOverview.company_count),
              ingestedCompanyCount: Number(databaseOverview.ingested_company_count),
              seededCompanyCount: Number(databaseOverview.seeded_company_count),
              addressCount: Number(databaseOverview.address_count),
              activityCount: Number(databaseOverview.activity_count),
              sourceRecordCount: Number(databaseOverview.source_record_count),
              latestCompanySourceAt: databaseOverview.latest_company_source_at
            }
          : null
      },
      meta: {
        generatedAt: new Date().toISOString(),
        dataAvailable: true,
        periodStart
      }
    };
  });
}
