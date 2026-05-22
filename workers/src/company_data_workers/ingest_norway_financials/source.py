from __future__ import annotations

from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://data.brreg.no/regnskapsregisteret/regnskap"
MAX_WORKERS = 8
MAX_RETRIES = 4
BACKOFF_FACTOR = 2


@dataclass(frozen=True)
class FinancialReport:
    org_number: str
    report_year: int
    revenue: float | None
    operating_result: float | None
    equity: float | None
    currency: str


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
    return session


def _parse_report(raw: dict) -> FinancialReport | None:
    periode = raw.get("regnskapsperiode") or {}
    til_dato = periode.get("tilDato") or ""
    if len(til_dato) < 4:
        return None
    try:
        report_year = int(til_dato[:4])
    except ValueError:
        return None

    org = (raw.get("virksomhet") or {}).get("organisasjonsnummer") or ""
    if not org:
        return None

    resultat = raw.get("resultatregnskapResultat") or {}
    drifts = resultat.get("driftsresultat") or {}
    inntekter = drifts.get("driftsinntekter") or {}
    revenue_raw = inntekter.get("sumDriftsinntekter")
    operating_raw = drifts.get("driftsresultat")

    ek_gjeld = raw.get("egenkapitalGjeld") or {}
    ek = ek_gjeld.get("egenkapital") or {}
    equity_raw = ek.get("sumEgenkapital")

    return FinancialReport(
        org_number=org,
        report_year=report_year,
        revenue=float(revenue_raw) if revenue_raw is not None else None,
        operating_result=float(operating_raw) if operating_raw is not None else None,
        equity=float(equity_raw) if equity_raw is not None else None,
        currency=raw.get("valuta") or "NOK",
    )


def _fetch_one(session: requests.Session, org_number: str) -> FinancialReport | None:
    try:
        resp = session.get(f"{BASE_URL}/{org_number}", timeout=30)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        reports = resp.json()
        if not reports:
            return None
        # API returns newest report first
        return _parse_report(reports[0])
    except Exception:
        return None


def fetch_financials(
    org_numbers: list[str],
    batch_size: int = 200,
) -> Iterator[list[FinancialReport]]:
    """
    Fetch financial reports for Norwegian org numbers in parallel.
    Yields batches of FinancialReport as they complete.
    """
    session = _make_session()
    batch: list[FinancialReport] = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(_fetch_one, session, org): org for org in org_numbers}
        for future in as_completed(futures):
            result = future.result()
            if result is not None:
                batch.append(result)
                if len(batch) >= batch_size:
                    yield batch
                    batch = []

    if batch:
        yield batch
