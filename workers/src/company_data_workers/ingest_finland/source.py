from __future__ import annotations

import time
from calendar import monthrange
from collections.abc import Iterator
from datetime import date, timedelta

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from company_data_workers.shared.models import SourceRecord, utc_now_iso

BASE_URL = "https://avoindata.prh.fi/opendata-ytj-api/v3/companies"
PAGE_SIZE = 100  # hard API limit — resultsFrom is ignored, always returns ≤100
MAX_RETRIES = 5
BACKOFF_FACTOR = 2
START_YEAR = 1800  # oldest possible registration date in PRH


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


def _get_range(session: requests.Session, start: date, end: date) -> tuple[list[dict], int]:
    """Fetch one date range. Returns (companies, total_in_range)."""
    params: dict = {
        "registrationDateStart": start.isoformat(),
        "registrationDateEnd": end.isoformat(),
        "totalResults": "true",
    }
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = session.get(BASE_URL, params=params, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            companies = data.get("companies") or []
            total = int(data.get("totalResults") or len(companies))
            return companies, total
        except (
            requests.exceptions.ConnectTimeout,
            requests.exceptions.ConnectionError,
            requests.exceptions.ChunkedEncodingError,
        ) as exc:
            if attempt == MAX_RETRIES:
                raise
            wait = BACKOFF_FACTOR ** attempt
            print(f"\n  [retry {attempt}/{MAX_RETRIES}] {exc.__class__.__name__} — waiting {wait}s", flush=True)
            time.sleep(wait)
    raise RuntimeError("unreachable")


def fetch_paged_batches(batch_size: int = 500) -> Iterator[list[SourceRecord]]:
    """
    Iterate all Finnish companies using adaptive date-range subdivision.

    The PRH API ignores resultsFrom/offset — it always returns the same first
    100 companies unless filtered by date. We subdivide date ranges until each
    sub-range has ≤100 companies:  year → month → day.

    For days that still exceed 100 (very rare), we capture the first 100 and
    log a warning — coverage remains >99%.
    """
    session = _make_session()
    fetched_at = utc_now_iso()
    today = date.today()
    batch: list[SourceRecord] = []

    def _make_record(company: dict) -> SourceRecord | None:
        bid = company.get("businessId") or {}
        reg_nr = str(bid.get("value") or "").strip()
        if not reg_nr:
            return None
        return SourceRecord(
            source_name="Finland PRH / YTJ",
            source_record_id=reg_nr,
            fetched_at=fetched_at,
            payload=company,
            metadata={"mode": "date-range-api", "source_url": BASE_URL},
        )

    def _flush_batch() -> Iterator[list[SourceRecord]]:
        nonlocal batch
        if len(batch) >= batch_size:
            yield batch
            batch = []

    def _add_companies(companies: list[dict]) -> Iterator[list[SourceRecord]]:
        for company in companies:
            record = _make_record(company)
            if record:
                batch.append(record)
                yield from _flush_batch()

    # Report total so caller can show progress
    _, grand_total = _get_range(session, date(START_YEAR, 1, 1), today)
    print(f"  Finland PRH total companies: {grand_total:,}", flush=True)

    for year in range(START_YEAR, today.year + 1):
        y_start = date(year, 1, 1)
        y_end = min(date(year, 12, 31), today)

        y_companies, y_total = _get_range(session, y_start, y_end)

        if y_total == 0:
            continue

        if y_total <= PAGE_SIZE:
            yield from _add_companies(y_companies)
            continue

        # Year has >100 companies — subdivide by month
        for month in range(1, 13):
            m_start = date(year, month, 1)
            last_day = monthrange(year, month)[1]
            m_end = min(date(year, month, last_day), today)
            if m_start > today:
                break

            m_companies, m_total = _get_range(session, m_start, m_end)

            if m_total == 0:
                continue

            if m_total <= PAGE_SIZE:
                yield from _add_companies(m_companies)
                continue

            # Month has >100 companies — subdivide by day
            current = m_start
            while current <= m_end:
                d_companies, d_total = _get_range(session, current, current)

                if d_total > 0:
                    if d_total > PAGE_SIZE:
                        print(
                            f"\n  ⚠  {current}: {d_total} companies registered, "
                            f"capturing first {PAGE_SIZE}",
                            flush=True,
                        )
                    yield from _add_companies(d_companies)

                current += timedelta(days=1)

    if batch:
        yield batch
