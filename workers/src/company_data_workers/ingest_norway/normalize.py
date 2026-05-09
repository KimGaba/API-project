from __future__ import annotations

from company_data_workers.shared.models import NormalizedCompany, SourceRecord


def normalize_records(records: list[SourceRecord]) -> list[NormalizedCompany]:
    normalized: list[NormalizedCompany] = []
    for record in records:
        payload = record.payload
        address = payload.get("forretningsadresse") or {}
        naeringskode = payload.get("naeringskode1") or {}

        normalized.append(
            NormalizedCompany(
                country_code="NO",
                source_name=record.source_name,
                source_record_id=record.source_record_id,
                registration_number=payload.get("organisasjonsnummer"),
                company_name=payload.get("navn"),
                status=payload.get("status"),
                legal_form=(payload.get("organisasjonsform") or {}).get("kode"),
                incorporation_date=payload.get("registreringsdatoEnhetsregisteret"),
                address={
                    "line1": " ".join(address.get("adresse", [])) or None,
                    "postal_code": address.get("postnummer"),
                    "city": address.get("poststed"),
                    "country_code": address.get("landkode") or "NO",
                },
                industry_codes=[
                    {
                        "code_system": "NO_SN2007",
                        "code": naeringskode.get("kode"),
                        "description": naeringskode.get("beskrivelse"),
                    }
                ]
                if naeringskode
                else [],
                raw_fetched_at=record.fetched_at,
            )
        )
    return normalized
