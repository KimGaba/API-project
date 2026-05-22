from __future__ import annotations

import os
import re
from contextlib import contextmanager
from typing import Iterator

import psycopg
from psycopg import Connection

from company_data_workers.shared.models import NormalizedCompany, SourceRecord

DEFAULT_DATABASE_URL = "postgresql://company_data:company_data_dev@localhost:55432/company_data_dev"
SOURCE_CODE_NORWAY = "no_brreg"
SOURCE_NAME_NORWAY = "Norway Brønnøysund Register Centre"
SOURCE_BASE_URL_NORWAY = "https://data.brreg.no/enhetsregisteret/api/"
LICENSE_TAG_NORWAY = "nlod-2.0-review"


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)


@contextmanager
def connect_db() -> Iterator[Connection]:
    with psycopg.connect(get_database_url()) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SET TIME ZONE 'UTC'")
        yield connection


def normalize_company_name(name: str | None) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", " ", (name or "").casefold())
    return re.sub(r"\s+", " ", cleaned).strip()


def map_company_status(value: str | None) -> str:
    if not value:
        return "unknown"

    normalized = value.strip().casefold()
    mapping = {
        "active": "active",
        "active_placeholder": "active",
        "inactive": "inactive",
        "dissolved": "dissolved",
        "liquidation": "liquidation",
        "bankruptcy": "bankruptcy",
    }
    return mapping.get(normalized, "unknown")


def ensure_norway_source(connection: Connection) -> str:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO source_registry (
              source_code,
              source_name,
              country_code,
              legal_owner,
              access_method,
              base_url,
              license_tag,
              commercial_reuse_allowed,
              attribution_required,
              update_cadence,
              coverage_notes
            ) VALUES (
              %s, %s, 'NO', 'Brønnøysundregistrene', 'api', %s, %s, TRUE, TRUE, 'daily',
              'Tiny MVP ingest path for Norway worker live/fixture samples.'
            )
            ON CONFLICT (source_code) DO UPDATE
            SET
              source_name = EXCLUDED.source_name,
              country_code = EXCLUDED.country_code,
              legal_owner = EXCLUDED.legal_owner,
              access_method = EXCLUDED.access_method,
              base_url = EXCLUDED.base_url,
              license_tag = EXCLUDED.license_tag,
              commercial_reuse_allowed = EXCLUDED.commercial_reuse_allowed,
              attribution_required = EXCLUDED.attribution_required,
              update_cadence = EXCLUDED.update_cadence,
              coverage_notes = EXCLUDED.coverage_notes,
              updated_at = NOW()
            RETURNING id
            """,
            (SOURCE_CODE_NORWAY, SOURCE_NAME_NORWAY, SOURCE_BASE_URL_NORWAY, LICENSE_TAG_NORWAY),
        )
        row = cursor.fetchone()
        if not row:
            raise RuntimeError("Failed to ensure Norway source registry row")
        return str(row[0])


def upsert_company_sample(
    connection: Connection,
    *,
    source_id: str,
    source_record: SourceRecord,
    normalized_company: NormalizedCompany,
    license_tag: str = LICENSE_TAG_NORWAY,
) -> str:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO companies (
              canonical_name,
              normalized_name,
              country_code,
              registration_number,
              vat_number,
              legal_form,
              status,
              incorporation_date,
              latest_source_id,
              latest_source_record_at,
              source_confidence
            ) VALUES (
              %s, %s, %s, %s, %s, %s, %s::company_status, %s::date, %s::uuid, %s::timestamptz, %s
            )
            ON CONFLICT (country_code, registration_number) DO UPDATE
            SET
              canonical_name = EXCLUDED.canonical_name,
              normalized_name = EXCLUDED.normalized_name,
              vat_number = COALESCE(companies.vat_number, EXCLUDED.vat_number),
              legal_form = EXCLUDED.legal_form,
              status = EXCLUDED.status,
              incorporation_date = COALESCE(EXCLUDED.incorporation_date, companies.incorporation_date),
              latest_source_id = EXCLUDED.latest_source_id,
              latest_source_record_at = EXCLUDED.latest_source_record_at,
              source_confidence = EXCLUDED.source_confidence,
              updated_at = NOW()
            RETURNING id
            """,
            (
                normalized_company.company_name or normalized_company.registration_number or "Unknown company",
                normalize_company_name(normalized_company.company_name),
                normalized_company.country_code,
                normalized_company.registration_number,
                None,
                normalized_company.legal_form,
                map_company_status(normalized_company.status),
                normalized_company.incorporation_date,
                source_id,
                normalized_company.raw_fetched_at,
                0.9,
            ),
        )
        company_row = cursor.fetchone()
        if not company_row:
            raise RuntimeError("Failed to upsert company")
        company_id = str(company_row[0])

        if normalized_company.registration_number:
            cursor.execute(
                """
                INSERT INTO company_identifiers (
                  company_id,
                  identifier_type,
                  identifier_value,
                  country_code,
                  source_id,
                  is_primary
                ) VALUES (%s, 'registration_number', %s, %s, %s::uuid, TRUE)
                ON CONFLICT (identifier_type, identifier_value, country_code) DO UPDATE
                SET
                  company_id = EXCLUDED.company_id,
                  source_id = EXCLUDED.source_id,
                  is_primary = TRUE
                """,
                (
                    company_id,
                    normalized_company.registration_number,
                    normalized_company.country_code,
                    source_id,
                ),
            )

        cursor.execute(
            "DELETE FROM company_addresses WHERE company_id = %s AND address_type = 'registered'",
            (company_id,),
        )
        address = normalized_company.address or {}
        cursor.execute(
            """
            INSERT INTO company_addresses (
              company_id,
              address_type,
              line1,
              city,
              postal_code,
              country_code,
              raw_text,
              is_primary
            ) VALUES (%s, 'registered', %s, %s, %s, %s, %s, TRUE)
            """,
            (
                company_id,
                address.get("line1"),
                address.get("city"),
                address.get("postal_code"),
                address.get("country_code") or normalized_company.country_code,
                ", ".join(
                    [
                        part
                        for part in [address.get("line1"), address.get("postal_code"), address.get("city")]
                        if part
                    ]
                )
                or None,
            ),
        )

        cursor.execute("DELETE FROM company_activities WHERE company_id = %s", (company_id,))
        for index, activity in enumerate(normalized_company.industry_codes):
            code = activity.get("code")
            code_system = activity.get("code_system")
            if not code or not code_system:
                continue
            cursor.execute(
                """
                INSERT INTO company_activities (
                  company_id,
                  code_system,
                  activity_code,
                  activity_description,
                  is_primary
                ) VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (company_id, code_system, activity_code) DO UPDATE
                SET
                  activity_description = EXCLUDED.activity_description,
                  is_primary = EXCLUDED.is_primary
                """,
                (
                    company_id,
                    code_system,
                    code,
                    activity.get("description"),
                    index == 0,
                ),
            )

        cursor.execute(
            """
            INSERT INTO source_records (
              company_id,
              source_id,
              source_record_id,
              raw_payload,
              extracted_payload,
              fetched_at,
              license_tag,
              confidence_score
            ) VALUES (%s, %s::uuid, %s, %s::jsonb, %s::jsonb, %s::timestamptz, %s, %s)
            ON CONFLICT (source_id, source_record_id) DO UPDATE
            SET
              company_id = EXCLUDED.company_id,
              raw_payload = EXCLUDED.raw_payload,
              extracted_payload = EXCLUDED.extracted_payload,
              fetched_at = EXCLUDED.fetched_at,
              license_tag = EXCLUDED.license_tag,
              confidence_score = EXCLUDED.confidence_score
            """,
            (
                company_id,
                source_id,
                source_record.source_record_id,
                psycopg.types.json.Jsonb(source_record.payload),
                psycopg.types.json.Jsonb(normalized_company.to_dict()),
                source_record.fetched_at,
                license_tag,
                0.9,
            ),
        )

    return company_id
