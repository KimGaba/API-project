"""
One-time backfill: populate employee_count, website, share_capital, share_capital_currency
and secondary industry codes from raw_payload already stored in source_records.

Run once after migration 0006:
  PYTHONPATH=src python -m company_data_workers.backfill_norway_enrichment
"""
from __future__ import annotations

from company_data_workers.shared.db import connect_db


def main() -> None:
    with connect_db() as conn:
        with conn.cursor() as cur:
            # Update scalar enrichment fields from raw_payload
            cur.execute("""
                UPDATE companies c
                SET
                  employee_count          = (sr.raw_payload->>'antallAnsatte')::int,
                  website                 = COALESCE(c.website, NULLIF(sr.raw_payload->>'hjemmeside', '')),
                  share_capital           = (sr.raw_payload->'kapital'->>'belop')::numeric,
                  share_capital_currency  = NULLIF(sr.raw_payload->'kapital'->>'valuta', '')
                FROM source_records sr
                JOIN source_registry reg ON sr.source_id = reg.id
                WHERE reg.source_code = 'no_brreg'
                  AND sr.company_id = c.id
                  AND (
                    sr.raw_payload->>'antallAnsatte'      IS NOT NULL
                    OR sr.raw_payload->>'hjemmeside'       IS NOT NULL
                    OR sr.raw_payload->'kapital'->>'belop' IS NOT NULL
                  )
            """)
            scalar_updated = cur.rowcount
            print(f"  Scalar fields updated: {scalar_updated:,} rows")

            # Insert naeringskode2
            cur.execute("""
                INSERT INTO company_activities (company_id, code_system, activity_code, activity_description, is_primary)
                SELECT
                  sr.company_id,
                  'NO_SN2007',
                  sr.raw_payload->'naeringskode2'->>'kode',
                  sr.raw_payload->'naeringskode2'->>'beskrivelse',
                  FALSE
                FROM source_records sr
                JOIN source_registry reg ON sr.source_id = reg.id
                WHERE reg.source_code = 'no_brreg'
                  AND sr.raw_payload->'naeringskode2'->>'kode' IS NOT NULL
                ON CONFLICT (company_id, code_system, activity_code) DO UPDATE
                  SET activity_description = EXCLUDED.activity_description,
                      is_primary           = FALSE
            """)
            kode2 = cur.rowcount
            print(f"  naeringskode2 rows upserted: {kode2:,}")

            # Insert naeringskode3
            cur.execute("""
                INSERT INTO company_activities (company_id, code_system, activity_code, activity_description, is_primary)
                SELECT
                  sr.company_id,
                  'NO_SN2007',
                  sr.raw_payload->'naeringskode3'->>'kode',
                  sr.raw_payload->'naeringskode3'->>'beskrivelse',
                  FALSE
                FROM source_records sr
                JOIN source_registry reg ON sr.source_id = reg.id
                WHERE reg.source_code = 'no_brreg'
                  AND sr.raw_payload->'naeringskode3'->>'kode' IS NOT NULL
                ON CONFLICT (company_id, code_system, activity_code) DO UPDATE
                  SET activity_description = EXCLUDED.activity_description,
                      is_primary           = FALSE
            """)
            kode3 = cur.rowcount
            print(f"  naeringskode3 rows upserted: {kode3:,}")

        conn.commit()
        print("Backfill complete.")


if __name__ == "__main__":
    main()
