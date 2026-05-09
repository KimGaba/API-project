from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class SourceRecord:
    source_name: str
    source_record_id: str
    fetched_at: str
    payload: dict[str, Any]
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class NormalizedCompany:
    country_code: str
    source_name: str
    source_record_id: str
    registration_number: str | None
    company_name: str | None
    status: str | None
    legal_form: str | None
    incorporation_date: str | None
    address: dict[str, Any]
    industry_codes: list[dict[str, Any]]
    raw_fetched_at: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
