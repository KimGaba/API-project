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
      act.activity_description AS "primaryActivity.description"
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
    }
  }));
}
