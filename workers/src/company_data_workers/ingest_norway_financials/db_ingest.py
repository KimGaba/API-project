from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

import psycopg

from company_data_workers.ingest_norway_financials.source import fetch_financials
from company_data_workers.shared.db import connect_db

SOURCE_CODE = "no_brreg"


@dataclass(frozen=True)
class IngestResult:
    fetched: int
    written: int
    skipped: int


def _get_norway_org_numbers(connection: psycopg.Connection) -> list[str]:
    with connection.cursor() as cur:
        cur.execute("""
            SELECT c.registration_number
            FROM companies c
            WHERE c.country_code = 'NO'
              AND c.registration_number IS NOT NULL
            ORDER BY c.registration_number
        """)
        return [row[0] for row in cur.fetchall()]


def _get_source_id(connection: psycopg.Connection) -> str:
    with connection.cursor() as cur:
        cur.execute("SELECT id FROM source_registry WHERE source_code = %s", (SOURCE_CODE,))
        row = cur.fetchone()
        if not row:
            raise RuntimeError("Norway source registry row not found — run Norway ingest first")
        return str(row[0])


def ingest_financials(batch_size: int = 200) -> IngestResult:
    fetched = 0
    written = 0
    skipped = 0

    with connect_db() as conn:
        source_id = _get_source_id(conn)
        org_numbers = _get_norway_org_numbers(conn)
        total = len(org_numbers)
        print(f"  Fetching financials for {total:,} Norwegian companies ({batch_size} concurrent batch size)...")

        fetched_at = datetime.now(timezone.utc)

        for batch in fetch_financials(org_numbers, batch_size=batch_size):
            with conn.cursor() as cur:
                for report in batch:
                    fetched += 1
                    cur.execute("""
                        SELECT id FROM companies
                        WHERE country_code = 'NO' AND registration_number = %s
                    """, (report.org_number,))
                    row = cur.fetchone()
                    if not row:
                        skipped += 1
                        continue
                    company_id = str(row[0])

                    cur.execute("""
                        INSERT INTO company_financials (
                          company_id, source_id, report_year,
                          revenue, operating_result, equity,
                          currency, fetched_at
                        ) VALUES (%s, %s::uuid, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (company_id, report_year) DO UPDATE
                        SET
                          revenue          = EXCLUDED.revenue,
                          operating_result = EXCLUDED.operating_result,
                          equity           = EXCLUDED.equity,
                          currency         = EXCLUDED.currency,
                          fetched_at       = EXCLUDED.fetched_at,
                          updated_at       = NOW()
                    """, (
                        company_id, source_id, report.report_year,
                        report.revenue, report.operating_result, report.equity,
                        report.currency, fetched_at,
                    ))
                    written += 1

            conn.commit()
            print(f"\r  {fetched:>8,} fetched  |  {written:>8,} written  |  {skipped:>5,} skipped", end="", flush=True)

    print()
    return IngestResult(fetched=fetched, written=written, skipped=skipped)
