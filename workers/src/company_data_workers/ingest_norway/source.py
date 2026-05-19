from __future__ import annotations

import gzip
import io
import os
import shutil
import tempfile
from collections.abc import Iterator
from decimal import Decimal
from typing import Any

import ijson
import requests

from company_data_workers.shared.config import WorkerConfig
from company_data_workers.shared.http import HttpClient
from company_data_workers.shared.models import SourceRecord, utc_now_iso


DEFAULT_BASE_URL = "https://data.brreg.no/enhetsregisteret/api/enheter"
BULK_URL = "https://data.brreg.no/enhetsregisteret/api/enheter/lastned"
DEFAULT_MODE = "fixture"
DEFAULT_PAGE_SIZE = 100
DEFAULT_MAX_PAGES = 5
MAX_PAGE_SIZE = 100
MAX_BATCH_LIMIT = 1000
MAX_MAX_PAGES = 20


def build_fixture_record(index: int) -> dict:
    orgnr = f"{910000000 + index}"
    return {
        "organisasjonsnummer": orgnr,
        "navn": f"Eksempelselskap Norge {index}",
        "organisasjonsform": {"kode": "AS", "beskrivelse": "Aksjeselskap"},
        "registreringsdatoEnhetsregisteret": "2020-01-01",
        "naeringskode1": {"kode": "62.010", "beskrivelse": "Programmeringstjenester"},
        "forretningsadresse": {
            "adresse": [f"Eksempelveien {index}"],
            "postnummer": "0150",
            "poststed": "OSLO",
            "landkode": "NO",
        },
        "status": "ACTIVE",
    }


def _read_int_env(name: str, default: int) -> int:
    raw = os.getenv(name, "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer, got: {raw!r}") from exc
    return value


def _build_live_plan(limit: int) -> dict[str, int]:
    if limit < 1:
        raise RuntimeError("--limit must be >= 1")
    if limit > MAX_BATCH_LIMIT:
        raise RuntimeError(
            f"Norway live mode caps --limit at {MAX_BATCH_LIMIT} records per run for MVP safety; got {limit}."
        )

    start_page = _read_int_env("NORWAY_LIVE_START_PAGE", 0)
    page_size = _read_int_env("NORWAY_LIVE_PAGE_SIZE", DEFAULT_PAGE_SIZE)
    max_pages = _read_int_env("NORWAY_LIVE_MAX_PAGES", DEFAULT_MAX_PAGES)

    if start_page < 0:
        raise RuntimeError("NORWAY_LIVE_START_PAGE must be >= 0")
    if page_size < 1:
        raise RuntimeError("NORWAY_LIVE_PAGE_SIZE must be >= 1")
    if max_pages < 1:
        raise RuntimeError("NORWAY_LIVE_MAX_PAGES must be >= 1")
    if page_size > MAX_PAGE_SIZE:
        raise RuntimeError(
            f"NORWAY_LIVE_PAGE_SIZE must be <= {MAX_PAGE_SIZE} because the Brønnøysund endpoint is paged at 100 max."
        )
    if max_pages > MAX_MAX_PAGES:
        raise RuntimeError(
            f"NORWAY_LIVE_MAX_PAGES must be <= {MAX_MAX_PAGES} for the current local MVP safety guard."
        )

    needed_pages = max(1, (limit + page_size - 1) // page_size)
    effective_max_pages = min(max_pages, needed_pages)

    return {
        "limit": limit,
        "start_page": start_page,
        "page_size": page_size,
        "max_pages": effective_max_pages,
        "requested_max_pages": max_pages,
    }


def _build_live_metadata(
    config: WorkerConfig,
    *,
    page: int,
    page_size: int,
    total_elements: int | None = None,
    total_pages: int | None = None,
    page_index_in_run: int,
    pages_in_run: int,
    requested_limit: int,
    start_page: int,
    requested_max_pages: int,
) -> dict[str, Any]:
    metadata: dict[str, Any] = {
        "source_base_url": config.source_base_url,
        "mode": "live-api-page",
        "request": {"page": page, "size": page_size},
        "run_window": {
            "start_page": start_page,
            "page_size": page_size,
            "pages_in_run": pages_in_run,
            "page_index_in_run": page_index_in_run,
            "requested_limit": requested_limit,
            "requested_max_pages": requested_max_pages,
        },
        "license": "NLOD",
        "attribution": "Brønnøysundregistrene / Enhetsregisteret",
        "safe_sample_only": True,
    }
    page_context: dict[str, Any] = {}
    if total_elements is not None:
        page_context["total_elements"] = total_elements
    if total_pages is not None:
        page_context["total_pages"] = total_pages
    if page_context:
        metadata["page_context"] = page_context
    return metadata


def fetch_live_records(config: WorkerConfig, limit: int) -> list[SourceRecord]:
    client = HttpClient(config)
    fetched_at = utc_now_iso()
    plan = _build_live_plan(limit)

    records: list[SourceRecord] = []
    pages_seen = 0

    for page_offset in range(plan["max_pages"]):
        page = plan["start_page"] + page_offset
        payload = client.get_json(config.source_base_url, params={"page": page, "size": plan["page_size"]})
        entities = ((payload or {}).get("_embedded") or {}).get("enheter") or []
        page_info = payload.get("page") or {}
        total_elements = page_info.get("totalElements")
        total_pages = page_info.get("totalPages")
        pages_seen += 1

        if not entities:
            break

        remaining = plan["limit"] - len(records)
        if remaining <= 0:
            break

        for entity in entities[:remaining]:
            source_record_id = str(entity.get("organisasjonsnummer") or "")
            if not source_record_id:
                continue
            records.append(
                SourceRecord(
                    source_name=config.source_name,
                    source_record_id=source_record_id,
                    fetched_at=fetched_at,
                    payload=entity,
                    metadata=_build_live_metadata(
                        config,
                        page=page,
                        page_size=plan["page_size"],
                        total_elements=total_elements,
                        total_pages=total_pages,
                        page_index_in_run=page_offset,
                        pages_in_run=plan["max_pages"],
                        requested_limit=plan["limit"],
                        start_page=plan["start_page"],
                        requested_max_pages=plan["requested_max_pages"],
                    ),
                )
            )

        if len(records) >= plan["limit"]:
            break
        if total_pages is not None and page + 1 >= total_pages:
            break

    if not records:
        return []

    for record in records:
        record.metadata["run_window"]["pages_fetched"] = pages_seen
        record.metadata["run_window"]["records_returned"] = len(records)

    return records


def fetch_fixture_records(config: WorkerConfig, limit: int) -> list[SourceRecord]:
    fetched_at = utc_now_iso()
    records: list[SourceRecord] = []
    for index in range(1, limit + 1):
        payload = build_fixture_record(index)
        records.append(
            SourceRecord(
                source_name=config.source_name,
                source_record_id=payload["organisasjonsnummer"],
                fetched_at=fetched_at,
                payload=payload,
                metadata={
                    "source_base_url": config.source_base_url,
                    "mode": "placeholder-fixture",
                    "next_step": "Replace with Brønnøysund bulk+updates adapter",
                },
            )
        )
    return records


def _sanitize(obj: Any) -> Any:
    """Recursively convert Decimal → float so payloads are JSON-serializable."""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(v) for v in obj]
    return obj


def fetch_bulk_batches(config: WorkerConfig, batch_size: int = 500) -> Iterator[list[SourceRecord]]:
    """Download the full Brønnøysund bulk file to disk, then yield batches of SourceRecord."""
    tmp_path: str | None = None
    try:
        # Download complete file to a temp location before parsing — avoids
        # IncompleteRead errors that occur when streaming 197MB over a long connection.
        print("  Downloading bulk file to disk...", flush=True)
        with tempfile.NamedTemporaryFile(suffix=".json.gz", delete=False) as tmp:
            tmp_path = tmp.name
            with requests.get(BULK_URL, stream=True, timeout=300) as response:
                response.raise_for_status()
                shutil.copyfileobj(response.raw, tmp, length=1024 * 1024)
        print(f"  Download complete ({os.path.getsize(tmp_path) // 1_000_000} MB). Parsing...", flush=True)

        fetched_at = utc_now_iso()
        batch: list[SourceRecord] = []

        with gzip.open(tmp_path, "rb") as gz:
            for entity in ijson.items(gz, "item"):
                org_nr = str(entity.get("organisasjonsnummer") or "").strip()
                if not org_nr:
                    continue
                batch.append(
                    SourceRecord(
                        source_name=config.source_name,
                        source_record_id=org_nr,
                        fetched_at=fetched_at,
                        payload=_sanitize(dict(entity)),
                        metadata={"mode": "bulk-download", "source_url": BULK_URL},
                    )
                )
                if len(batch) >= batch_size:
                    yield batch
                    batch = []

        if batch:
            yield batch

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


def fetch_records(config: WorkerConfig, limit: int) -> list[SourceRecord]:
    mode = os.getenv("NORWAY_SOURCE_MODE", DEFAULT_MODE).strip().lower()
    if mode == "live":
        return fetch_live_records(config, limit)
    return fetch_fixture_records(config, limit)
