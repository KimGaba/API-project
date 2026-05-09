from __future__ import annotations

import os
from typing import Any

import requests

from company_data_workers.ingest_uk.validation import parse_company_numbers_csv
from company_data_workers.shared.config import WorkerConfig
from company_data_workers.shared.models import SourceRecord, utc_now_iso


DEFAULT_BASE_URL = "https://api.company-information.service.gov.uk/company"
DEFAULT_MODE = "fixture"


def build_fixture_record(index: int) -> dict:
    company_number = f"{10000000 + index}"
    return {
        "company_number": company_number,
        "company_name": f"Example UK Company {index} Ltd",
        "company_status": "active",
        "type": "ltd",
        "date_of_creation": "2019-04-06",
        "sic_codes": ["62012", "63110"],
        "registered_office_address": {
            "address_line_1": f"{index} Example Street",
            "postal_code": "EC1A 1AA",
            "locality": "London",
            "country": "United Kingdom",
        },
    }


def _sample_company_numbers(limit: int) -> list[str]:
    configured = os.getenv("UK_COMPANY_NUMBERS", "")
    result = parse_company_numbers_csv(configured)
    if result.invalid:
        raise RuntimeError(
            "UK_COMPANY_NUMBERS contains invalid values: "
            + ", ".join(result.invalid)
            + ". Use 1-8 alphanumeric Companies House numbers; numeric values may be provided without leading zeroes."
        )
    return result.normalized[:limit]


def fetch_live_records(config: WorkerConfig, limit: int) -> list[SourceRecord]:
    api_key = os.getenv("COMPANIES_HOUSE_API_KEY", "").strip()
    company_numbers = _sample_company_numbers(limit)
    if not api_key:
        raise RuntimeError("UK live mode requires COMPANIES_HOUSE_API_KEY")
    if not company_numbers:
        raise RuntimeError(
            "UK live mode requires UK_COMPANY_NUMBERS=00000006,00000007,... or the live_sample helper. "
            "Example: python -m company_data_workers.ingest_uk.live_sample 6 7 --check-only"
        )

    fetched_at = utc_now_iso()
    records: list[SourceRecord] = []
    session = requests.Session()
    session.auth = (api_key, "")

    for company_number in company_numbers:
        response = session.get(f"{config.source_base_url.rstrip('/')}/{company_number}", timeout=config.timeout_seconds)
        response.raise_for_status()
        payload = response.json()
        records.append(
            SourceRecord(
                source_name=config.source_name,
                source_record_id=str(payload.get("company_number") or company_number),
                fetched_at=fetched_at,
                payload=payload,
                metadata={
                    "source_base_url": config.source_base_url,
                    "mode": "live-company-profile",
                    "endpoint": "company-profile",
                    "license": "OGL",
                    "attribution": "Companies House",
                    "safe_sample_only": True,
                    "requested_company_number": company_number,
                },
            )
        )
    return records


def fetch_fixture_records(config: WorkerConfig, limit: int) -> list[SourceRecord]:
    fetched_at = utc_now_iso()
    api_key_present = bool(os.getenv("COMPANIES_HOUSE_API_KEY"))
    records: list[SourceRecord] = []
    for index in range(1, limit + 1):
        payload = build_fixture_record(index)
        records.append(
            SourceRecord(
                source_name=config.source_name,
                source_record_id=payload["company_number"],
                fetched_at=fetched_at,
                payload=payload,
                metadata={
                    "source_base_url": config.source_base_url,
                    "api_key_present": api_key_present,
                    "mode": "placeholder-fixture",
                    "next_step": "Replace with Companies House profile/search/stream adapters",
                },
            )
        )
    return records


def fetch_records(config: WorkerConfig, limit: int) -> list[SourceRecord]:
    mode = os.getenv("UK_SOURCE_MODE", DEFAULT_MODE).strip().lower()
    if mode == "live":
        return fetch_live_records(config, limit)
    return fetch_fixture_records(config, limit)
