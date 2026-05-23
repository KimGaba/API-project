from __future__ import annotations

import csv
import io
import zipfile
from collections.abc import Iterator
from datetime import date

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from company_data_workers.shared.models import SourceRecord, utc_now_iso

# Companies House publishes BasicCompanyData on the 1st of each month.
# URL pattern: http://download.companieshouse.gov.uk/BasicCompanyDataAsOneFile-YYYY-MM-01.zip
CH_BULK_BASE = "http://download.companieshouse.gov.uk"
SOURCE_NAME = "Companies House (UK)"


_STATUS_MAP = {
    "active":                   "active",
    "dissolved":                "dissolved",
    "liquidation":              "liquidation",
    "receivership":             "liquidation",
    "administration":           "liquidation",
    "voluntary arrangement":    "liquidation",
    "insolvency proceedings":   "liquidation",
    "converted/closed":         "dissolved",
    "in administration":        "liquidation",
}


def _bulk_url() -> str:
    today = date.today()
    return f"{CH_BULK_BASE}/BasicCompanyDataAsOneFile-{today.year}-{today.month:02d}-01.zip"


def _make_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=5,
        backoff_factor=2,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
    )
    session.mount("http://", HTTPAdapter(max_retries=retry))
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def _parse_sic(raw: str) -> dict | None:
    """'12345 - Description' → {code, description} or None for empty/invalid."""
    raw = raw.strip()
    if not raw or raw == "None Supplied":
        return None
    if " - " in raw:
        code, _, desc = raw.partition(" - ")
        return {"code_system": "SIC2007", "code": code.strip(), "description": desc.strip()}
    return {"code_system": "SIC2007", "code": raw, "description": None}


def _row_to_record(row: dict, fetched_at: str) -> SourceRecord | None:
    reg_nr = (row.get("CompanyNumber") or "").strip()
    if not reg_nr:
        return None

    sic_codes = [
        c for raw in [
            row.get("SICCode.SicText_1", ""),
            row.get("SICCode.SicText_2", ""),
            row.get("SICCode.SicText_3", ""),
            row.get("SICCode.SicText_4", ""),
        ]
        if (c := _parse_sic(raw)) is not None
    ]

    status_raw = (row.get("CompanyStatus") or "").strip().lower()
    status = _STATUS_MAP.get(status_raw, "unknown")

    payload = {
        "company_number":       reg_nr,
        "company_name":         (row.get("CompanyName") or "").strip() or None,
        "company_status":       status,
        "type":                 (row.get("CompanyCategory") or "").strip() or None,
        "date_of_creation":     (row.get("IncorporationDate") or "").strip() or None,
        "sic_codes":            [c["code"] for c in sic_codes],
        "sic_descriptions":     {c["code"]: c["description"] for c in sic_codes},
        "registered_office_address": {
            "address_line_1": (row.get("RegAddress.AddressLine1") or "").strip() or None,
            "address_line_2": (row.get("RegAddress.AddressLine2") or "").strip() or None,
            "locality":       (row.get("RegAddress.PostTown") or "").strip() or None,
            "postal_code":    (row.get("RegAddress.PostCode") or "").strip() or None,
            "country":        (row.get("RegAddress.Country") or "").strip() or None,
        },
    }

    return SourceRecord(
        source_name=SOURCE_NAME,
        source_record_id=reg_nr,
        fetched_at=fetched_at,
        payload=payload,
        metadata={"mode": "bulk-csv", "source_url": CH_BULK_BASE},
    )


def fetch_bulk_records(
    batch_size: int = 500,
    url: str | None = None,
) -> Iterator[list[SourceRecord]]:
    """
    Download and stream Companies House BasicCompanyData CSV.
    Yields batches of SourceRecord without writing to disk.
    """
    target_url = url or _bulk_url()
    print(f"  Downloading Companies House bulk data from {target_url} ...", flush=True)

    session = _make_session()
    resp = session.get(target_url, stream=True, timeout=300)
    if resp.status_code == 404:
        # Try previous month as fallback
        today = date.today()
        month = today.month - 1 or 12
        year = today.year if today.month > 1 else today.year - 1
        target_url = f"{CH_BULK_BASE}/BasicCompanyDataAsOneFile-{year}-{month:02d}-01.zip"
        print(f"  404 — retrying with previous month: {target_url}", flush=True)
        resp = session.get(target_url, stream=True, timeout=300)
    resp.raise_for_status()

    content = resp.content  # ~120 MB compressed; load into memory
    print(f"  Downloaded {len(content) / 1_048_576:.0f} MB, parsing ...", flush=True)

    fetched_at = utc_now_iso()
    batch: list[SourceRecord] = []

    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        csv_names = [n for n in zf.namelist() if n.endswith(".csv")]
        for csv_name in csv_names:
            with zf.open(csv_name) as f:
                reader = csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig"))
                for row in reader:
                    # CSV header has inconsistent spaces after commas — strip all keys
                    stripped = {k.strip(): v for k, v in row.items()}
                    record = _row_to_record(stripped, fetched_at)
                    if record:
                        batch.append(record)
                        if len(batch) >= batch_size:
                            yield batch
                            batch = []

    if batch:
        yield batch
