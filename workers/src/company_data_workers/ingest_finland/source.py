from __future__ import annotations

import time
from collections.abc import Iterator

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from company_data_workers.shared.models import SourceRecord, utc_now_iso

BASE_URL = "https://avoindata.prh.fi/opendata-ytj-api/v3/companies"
PAGE_SIZE = 100
MAX_RETRIES = 5
BACKOFF_FACTOR = 2  # waits 2, 4, 8, 16, 32 seconds between retries


def _make_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def _get_with_retry(session: requests.Session, params: dict) -> dict:
    """GET with urllib3 retry + an outer connect-timeout retry loop."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = session.get(BASE_URL, params=params, timeout=60)
            resp.raise_for_status()
            return resp.json()
        except (requests.exceptions.ConnectTimeout,
                requests.exceptions.ConnectionError) as exc:
            if attempt == MAX_RETRIES:
                raise
            wait = BACKOFF_FACTOR ** attempt
            print(f"\n  [retry {attempt}/{MAX_RETRIES}] {exc.__class__.__name__} — waiting {wait}s", flush=True)
            time.sleep(wait)
    raise RuntimeError("unreachable")


def fetch_paged_batches(batch_size: int = 500) -> Iterator[list[SourceRecord]]:
    """Page through the full PRH company register and yield batches."""
    fetched_at = utc_now_iso()
    batch: list[SourceRecord] = []
    results_from = 0
    total_results: int | None = None
    session = _make_session()

    while True:
        params: dict = {"maxResults": PAGE_SIZE, "resultsFrom": results_from}
        if total_results is None:
            params["totalResults"] = "true"

        data = _get_with_retry(session, params)

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
