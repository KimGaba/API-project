from __future__ import annotations

from dataclasses import dataclass

from company_data_workers.ingest_norway.normalize import normalize_records
from company_data_workers.ingest_norway.source import fetch_records
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
    with connect_db() as connection:
        source_id = ensure_norway_source(connection)
        for source_record, normalized_company in zip(records, normalized, strict=False):
            if not normalized_company.registration_number:
                continue
            upsert_company_sample(
                connection,
                source_id=source_id,
                source_record=source_record,
                normalized_company=normalized_company,
            )
            written += 1
        connection.commit()

    return IngestResult(seen=len(records), written=written)
