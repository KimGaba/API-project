from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from company_data_workers.ingest_norway.normalize import normalize_records
from company_data_workers.ingest_norway.source import fetch_bulk_batches, fetch_records
from company_data_workers.shared.config import WorkerConfig
from company_data_workers.shared.db import connect_db, ensure_norway_source, upsert_company_sample


@dataclass(frozen=True)
class IngestResult:
    seen: int
    written: int


def ingest_to_db(config: WorkerConfig, *, limit: int) -> IngestResult:
    records = fetch_records(config, limit)
    normalized = normalize_records(records)

    written = 0
    failed = 0
    error_message: str | None = None

    with connect_db() as connection:
        source_id = ensure_norway_source(connection)

        with connection.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ingestion_runs (source_id, run_type, status, started_at, records_seen)
                VALUES (%s::uuid, 'full', 'running', %s, %s)
                RETURNING id
                """,
                (source_id, datetime.now(timezone.utc), len(records)),
            )
            run_id = str(cur.fetchone()[0])
        connection.commit()

        try:
            for source_record, normalized_company in zip(records, normalized, strict=False):
                if not normalized_company.registration_number:
                    failed += 1
                    continue
                upsert_company_sample(
                    connection,
                    source_id=source_id,
                    source_record=source_record,
                    normalized_company=normalized_company,
                )
                written += 1
            connection.commit()
        except Exception as exc:
            error_message = str(exc)
            connection.rollback()

        status = "failed" if error_message else ("partial" if failed > 0 and written == 0 else "succeeded")
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
                (status, datetime.now(timezone.utc), len(records), written, failed, error_message, run_id),
            )
        connection.commit()

    return IngestResult(seen=len(records), written=written)


def ingest_bulk_to_db(config: WorkerConfig, batch_size: int = 500) -> IngestResult:
    seen = 0
    written = 0
    failed = 0
    error_message: str | None = None

    with connect_db() as connection:
        source_id = ensure_norway_source(connection)

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
            for batch in fetch_bulk_batches(config, batch_size):
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
        raise RuntimeError(f"Bulk ingest failed: {error_message}")
    return IngestResult(seen=seen, written=written)
