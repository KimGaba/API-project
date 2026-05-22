import type { CompanySearchResult } from '../types/api.js';
import { query as dbQuery } from '../lib/db.js';

export async function searchCompanies(input: { q?: string; country?: string; limit?: number }): Promise<CompanySearchResult[]> {
  const sql = `
    SELECT
      c.id::text,
      c.country_code AS "countryCode",
      c.registration_number AS "registrationNumber",
      c.canonical_name AS name,
      c.status::text AS status,
      COALESCE(sr.source_code, 'seed') AS source,
      COALESCE(sr.source_name, 'Seeded demo data') AS "sourceName",
      CASE WHEN c.latest_source_id IS NULL THEN 'seed' ELSE 'ingested' END AS "recordOrigin",
      c.latest_source_record_at AS "latestSourceAt",
      addr.line1 AS "address.line1",
      addr.city AS "address.city",
      addr.postal_code AS "address.postalCode",
      act.activity_code AS "primaryActivity.code",
      act.activity_description AS "primaryActivity.description",
      c.employee_count AS "enrichment.employeeCount",
      c.website AS "enrichment.website",
      c.share_capital AS "enrichment.shareCapital",
      c.share_capital_currency AS "enrichment.shareCapitalCurrency",
      fin.report_year AS "enrichment.latestReportYear",
      fin.revenue AS "enrichment.revenue",
      fin.operating_result AS "enrichment.operatingResult",
      fin.equity AS "enrichment.equity"
    FROM companies c
    LEFT JOIN source_registry sr ON sr.id = c.latest_source_id
    LEFT JOIN LATERAL (
      SELECT line1, city, postal_code
      FROM company_addresses
      WHERE company_id = c.id
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1
    ) addr ON TRUE
    LEFT JOIN LATERAL (
      SELECT activity_code, activity_description
      FROM company_activities
      WHERE company_id = c.id
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1
    ) act ON TRUE
    LEFT JOIN LATERAL (
      SELECT report_year, revenue, operating_result, equity
      FROM company_financials
      WHERE company_id = c.id
      ORDER BY report_year DESC
      LIMIT 1
    ) fin ON TRUE
    WHERE ($1::text IS NULL OR c.country_code = $1)
      AND (
        $2::text IS NULL
        OR c.canonical_name ILIKE '%' || $2 || '%'
        OR COALESCE(c.registration_number, '') ILIKE '%' || $2 || '%'
      )
    ORDER BY
      CASE WHEN c.latest_source_id IS NULL THEN 1 ELSE 0 END ASC,
      c.latest_source_record_at DESC NULLS LAST,
      c.canonical_name ASC
    LIMIT $3
  `;

  const result = await dbQuery(sql, [
    input.country?.trim().toUpperCase() || null,
    input.q?.trim() || null,
    input.limit ?? 10
  ]);

  return result.rows.map((row) => ({
    id: String(row.id),
    countryCode: String(row.countryCode),
    registrationNumber: String(row.registrationNumber ?? ''),
    name: String(row.name),
    status: row.status as CompanySearchResult['status'],
    source: String(row.source),
    sourceName: String(row.sourceName),
    recordOrigin: row.recordOrigin as CompanySearchResult['recordOrigin'],
    latestSourceAt: row.latestSourceAt ? new Date(String(row.latestSourceAt)).toISOString() : null,
    address: {
      line1: row['address.line1'] ? String(row['address.line1']) : null,
      city: row['address.city'] ? String(row['address.city']) : null,
      postalCode: row['address.postalCode'] ? String(row['address.postalCode']) : null,
    },
    primaryActivity: {
      code: row['primaryActivity.code'] ? String(row['primaryActivity.code']) : null,
      description: row['primaryActivity.description'] ? String(row['primaryActivity.description']) : null,
    },
    enrichment: {
      employeeCount: row['enrichment.employeeCount'] != null ? Number(row['enrichment.employeeCount']) : null,
      website: row['enrichment.website'] ? String(row['enrichment.website']) : null,
      shareCapital: row['enrichment.shareCapital'] != null ? Number(row['enrichment.shareCapital']) : null,
      shareCapitalCurrency: row['enrichment.shareCapitalCurrency'] ? String(row['enrichment.shareCapitalCurrency']) : null,
      latestReportYear: row['enrichment.latestReportYear'] != null ? Number(row['enrichment.latestReportYear']) : null,
      revenue: row['enrichment.revenue'] != null ? Number(row['enrichment.revenue']) : null,
      operatingResult: row['enrichment.operatingResult'] != null ? Number(row['enrichment.operatingResult']) : null,
      equity: row['enrichment.equity'] != null ? Number(row['enrichment.equity']) : null,
    }
  }));
}
