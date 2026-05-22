from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

import psycopg

from company_data_workers.ingest_finland.normalize import normalize_records
from company_data_workers.ingest_finland.source import fetch_paged_batches
from company_data_workers.shared.db import connect_db, upsert_company_sample

SOURCE_CODE = "fi_prh"
SOURCE_NAME = "Finland PRH / YTJ"
BASE_URL = "https://avoindata.prh.fi/opendata-ytj-api/v3/companies"
LICENSE_TAG = "cc-by-4.0"


@dataclass(frozen=True)
class IngestResult:
    seen: int
    written: int


def ensure_finland_source(connection: psycopg.Connection) -> str:
    with connection.cursor() as cur:
        cur.execute(
            """
            INSERT INTO source_registry (
              source_code, source_name, country_code, legal_owner,
              access_method, base_url, license_tag,
              commercial_reuse_allowed, attribution_required,
              update_cadence, coverage_notes
            ) VALUES (
              %s, %s, 'FI', 'Patentti- ja rekisterihallitus (PRH)',
              'api', %s, %s,
              TRUE, TRUE, 'daily',
              'Full company register via PRH opendata-ytj-api.'
            )
            ON CONFLICT (source_code) DO UPDATE
            SET source_name = EXCLUDED.source_name,
                base_url = EXCLUDED.base_url,
                updated_at = NOW()
            RETURNING id
            """,
            (SOURCE_CODE, SOURCE_NAME, BASE_URL, LICENSE_TAG),
        )
        row = cur.fetchone()
        if not row:
            raise RuntimeError("Failed to ensure Finland source registry row")
        return str(row[0])


def ingest_bulk_to_db(batch_size: int = 500) -> IngestResult:
    seen = 0
    written = 0
    failed = 0
    error_message: str | None = None

    with connect_db() as connection:
        source_id = ensure_finland_source(connection)

        with connection.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ingestion_runs (source_id, run_type, status, started_at)
                VALUES (%s::uuid, 'bulk', 'running', %s)
                RETURNING id
                """,
                (source_id, datetime.now(timezone.utc)),
            )
            run_id = str(cur.fetchone()[0])
        connection.commit()

        try:
            for batch in fetch_paged_batches(batch_size):
                normalized = normalize_records(batch)
                batch_written = 0
                batch_failed = 0

                for source_record, nc in zip(batch, normalized, strict=False):
                    if not nc.registration_number:
                        batch_failed += 1
                        continue
                    upsert_company_sample(
                        connection,
                        source_id=source_id,
                        source_record=source_record,
                        normalized_company=nc,
                        license_tag=LICENSE_TAG,
                    )
                    batch_written += 1

                connection.commit()
                seen += len(batch)
                written += batch_written
                failed += batch_failed

                with connection.cursor() as cur:
                    cur.execute(
                        "UPDATE ingestion_runs SET records_seen=%s, records_written=%s, records_failed=%s WHERE id=%s::uuid",
                        (seen, written, failed, run_id),
                    )
                connection.commit()

                print(f"\r  {seen:>8,} seen  |  {written:>8,} written  |  {failed:>5,} failed", end="", flush=True)

        except Exception as exc:
            error_message = str(exc)
            connection.rollback()

        status = "failed" if error_message else "succeeded"
        with connection.cursor() as cur:
            cur.execute(
                """
                UPDATE ingestion_runs
                SET status = %s::ingestion_run_status,
                    completed_at = %s,
                    records_seen = %s,
                    records_written = %s,
                    records_failed = %s,
                    error_message = %s
                WHERE id = %s::uuid
                """,
                (status, datetime.now(timezone.utc), seen, written, failed, error_message, run_id),
            )
        connection.commit()

    print()
    if error_message:
        raise RuntimeError(f"Finland ingest failed: {error_message}")
    return IngestResult(seen=seen, written=written)
