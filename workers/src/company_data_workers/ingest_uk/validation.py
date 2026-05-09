from __future__ import annotations

import re
from dataclasses import dataclass

_COMPANY_NUMBER_RE = re.compile(r"^[A-Z0-9]{1,8}$")


@dataclass(frozen=True)
class ValidationResult:
    normalized: list[str]
    invalid: list[str]


def normalize_company_number(value: str) -> str:
    cleaned = value.strip().upper().replace(" ", "")
    if not cleaned:
        raise ValueError("empty company number")
    if cleaned.isdigit():
        cleaned = cleaned.zfill(8)
    if not _COMPANY_NUMBER_RE.fullmatch(cleaned):
        raise ValueError(f"invalid company number: {value!r}")
    return cleaned


def validate_company_numbers(values: list[str]) -> ValidationResult:
    normalized: list[str] = []
    invalid: list[str] = []
    seen: set[str] = set()

    for value in values:
        try:
            company_number = normalize_company_number(value)
        except ValueError:
            invalid.append(value)
            continue

        if company_number not in seen:
            normalized.append(company_number)
            seen.add(company_number)

    return ValidationResult(normalized=normalized, invalid=invalid)


def parse_company_numbers_csv(raw: str) -> ValidationResult:
    values = [item for item in raw.split(",") if item.strip()]
    return validate_company_numbers(values)
