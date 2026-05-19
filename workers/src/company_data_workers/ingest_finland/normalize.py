from __future__ import annotations

from company_data_workers.shared.models import NormalizedCompany, SourceRecord


def _active(items: list[dict], *, key: str = "endDate") -> dict:
    """Return first entry with no endDate, or first entry."""
    for item in items:
        if not item.get(key):
            return item
    return items[0] if items else {}


def _en_desc(descriptions: list[dict]) -> str | None:
    """Pick the English description (languageCode '3') from a descriptions list."""
    for d in descriptions:
        if d.get("languageCode") == "3":
            return d.get("description")
    return (descriptions[0].get("description")) if descriptions else None


def _derive_status(payload: dict) -> str:
    liquidations = payload.get("liquidations") or []
    dissolutions = payload.get("dissolutions") or []
    bankruptcies = payload.get("bankruptcies") or []

    active_liq = any(not e.get("endDate") for e in liquidations)
    active_dis = any(not e.get("endDate") for e in dissolutions)
    active_ban = any(not e.get("endDate") for e in bankruptcies)

    if active_ban:
        return "bankruptcy"
    if active_liq:
        return "liquidation"
    if active_dis:
        return "dissolved"
    return "active"


def normalize_records(records: list[SourceRecord]) -> list[NormalizedCompany]:
    normalized: list[NormalizedCompany] = []
    for record in records:
        p = record.payload
        bid = p.get("businessId") or {}

        names = p.get("names") or []
        active_name = _active(names)
        company_name = active_name.get("name")

        forms = p.get("companyForms") or []
        active_form = _active(forms)
        legal_form = _en_desc(active_form.get("descriptions") or []) or active_form.get("type")

        addresses = p.get("addresses") or []
        # type 1 = visiting address, type 2 = postal address — prefer type 2
        addr = next((a for a in addresses if a.get("type") == 2), None) or \
               next((a for a in addresses if a.get("type") == 1), None) or {}
        post_offices = addr.get("postOffices") or []
        city = next((o.get("city") for o in post_offices if o.get("languageCode") == "1"), None)
        street_parts = [addr.get("street") or "", addr.get("buildingNumber") or ""]
        line1 = " ".join(p for p in street_parts if p).strip() or None

        biz_line = p.get("mainBusinessLine") or {}
        biz_code = biz_line.get("type")
        biz_desc = _en_desc(biz_line.get("descriptions") or [])

        normalized.append(
            NormalizedCompany(
                country_code="FI",
                source_name=record.source_name,
                source_record_id=record.source_record_id,
                registration_number=str(bid.get("value") or "").strip() or None,
                company_name=company_name,
                status=_derive_status(p),
                legal_form=legal_form,
                incorporation_date=p.get("registrationDate") or bid.get("registrationDate"),
                address={
                    "line1": line1,
                    "postal_code": addr.get("postCode"),
                    "city": city,
                    "country_code": "FI",
                },
                industry_codes=[
                    {"code_system": "FI_TOL2008", "code": biz_code, "description": biz_desc}
                ] if biz_code else [],
                raw_fetched_at=record.fetched_at,
            )
        )
    return normalized
