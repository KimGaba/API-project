from __future__ import annotations

from company_data_workers.shared.models import NormalizedCompany, SourceRecord


def normalize_records(records: list[SourceRecord]) -> list[NormalizedCompany]:
    normalized: list[NormalizedCompany] = []
    for record in records:
        payload = record.payload
        address = payload.get("forretningsadresse") or {}
        naeringskode = payload.get("naeringskode1") or {}

        industry_codes = []
        for kode_field in ("naeringskode1", "naeringskode2", "naeringskode3"):
            kode = payload.get(kode_field) or {}
            if kode.get("kode"):
                industry_codes.append({
                    "code_system": "NO_SN2007",
                    "code": kode["kode"],
                    "description": kode.get("beskrivelse"),
                })

        kapital = payload.get("kapital") or {}
        ansatte_raw = payload.get("antallAnsatte")

        normalized.append(
            NormalizedCompany(
                country_code="NO",
                source_name=record.source_name,
                source_record_id=record.source_record_id,
                registration_number=payload.get("organisasjonsnummer"),
                company_name=payload.get("navn"),
                status=(
                    "bankruptcy" if payload.get("konkurs")
                    else "liquidation" if payload.get("underAvvikling") or payload.get("underTvangsavviklingEllerTvangsopplosning")
                    else "active"
                ),
                legal_form=(payload.get("organisasjonsform") or {}).get("kode"),
                incorporation_date=payload.get("registreringsdatoEnhetsregisteret"),
                address={
                    "line1": " ".join(address.get("adresse", [])) or None,
                    "postal_code": address.get("postnummer"),
                    "city": address.get("poststed"),
                    "country_code": address.get("landkode") or "NO",
                },
                industry_codes=industry_codes,
                raw_fetched_at=record.fetched_at,
                employee_count=int(ansatte_raw) if ansatte_raw is not None else None,
                website=payload.get("hjemmeside") or None,
                share_capital=float(kapital["belop"]) if kapital.get("belop") is not None else None,
                share_capital_currency=kapital.get("valuta") or None,
            )
        )
    return normalized
