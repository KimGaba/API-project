from __future__ import annotations

from company_data_workers.shared.models import NormalizedCompany, SourceRecord


def normalize_records(records: list[SourceRecord]) -> list[NormalizedCompany]:
    normalized: list[NormalizedCompany] = []
    for record in records:
        payload = record.payload
        address = payload.get("registered_office_address") or {}

        normalized.append(
            NormalizedCompany(
                country_code="GB",
                source_name=record.source_name,
                source_record_id=record.source_record_id,
                registration_number=payload.get("company_number"),
                company_name=payload.get("company_name"),
                status=payload.get("company_status"),
                legal_form=payload.get("type"),
                incorporation_date=payload.get("date_of_creation"),
                address={
                    "line1": address.get("address_line_1"),
                    "postal_code": address.get("postal_code"),
                    "city": address.get("locality"),
                    "country_code": "GB",
                    "country_name": address.get("country"),
                },
                industry_codes=[
                    {
                        "code_system": "SIC2007",
                        "code": code,
                        "description": None,
                    }
                    for code in payload.get("sic_codes", [])
                ],
                raw_fetched_at=record.fetched_at,
            )
        )
    return normalized
