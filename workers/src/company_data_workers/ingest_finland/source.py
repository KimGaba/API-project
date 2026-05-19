from __future__ import annotations

from collections.abc import Iterator

import requests

from company_data_workers.shared.models import SourceRecord, utc_now_iso

BASE_URL = "https://avoindata.prh.fi/opendata-ytj-api/v3/companies"
PAGE_SIZE = 100


def fetch_paged_batches(batch_size: int = 500) -> Iterator[list[SourceRecord]]:
    """Page through the full PRH company register and yield batches."""
    fetched_at = utc_now_iso()
    batch: list[SourceRecord] = []
    results_from = 0
    total_results: int | None = None
    session = requests.Session()

    while True:
        params: dict = {"maxResults": PAGE_SIZE, "resultsFrom": results_from}
        if total_results is None:
            params["totalResults"] = "true"

        resp = session.get(BASE_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        if total_results is None:
            total_results = int(data.get("totalResults") or 0)
            print(f"  Finland PRH total companies: {total_results:,}")

        companies = data.get("companies") or []
        if not companies:
            break

        for company in companies:
            bid = company.get("businessId") or {}
            reg_nr = str(bid.get("value") or "").strip()
            if not reg_nr:
                continue
            batch.append(
                SourceRecord(
                    source_name="Finland PRH / YTJ",
                    source_record_id=reg_nr,
                    fetched_at=fetched_at,
                    payload=company,
                    metadata={"mode": "paged-api", "resultsFrom": results_from, "source_url": BASE_URL},
                )
            )
            if len(batch) >= batch_size:
                yield batch
                batch = []

        results_from += len(companies)
        if results_from >= total_results:
            break

    if batch:
        yield batch
