from __future__ import annotations

import os

from company_data_workers.ingest_norway.db_ingest import ingest_to_db
from company_data_workers.ingest_norway.normalize import normalize_records
from company_data_workers.ingest_norway.source import DEFAULT_BASE_URL, fetch_records
from company_data_workers.shared.config import build_config
from company_data_workers.shared.runner import WorkerRunner, build_parser


def _apply_live_paging_args(args: object) -> None:
    mappings = {
        "start_page": "NORWAY_LIVE_START_PAGE",
        "page_size": "NORWAY_LIVE_PAGE_SIZE",
        "max_pages": "NORWAY_LIVE_MAX_PAGES",
    }
    for attr_name, env_name in mappings.items():
        value = getattr(args, attr_name, None)
        if value is not None:
            os.environ[env_name] = str(value)


def main() -> None:
    parser = build_parser("ingest-norway")
    args = parser.parse_args()
    _apply_live_paging_args(args)

    config = build_config(
        country_code="NO",
        source_name="brreg-enhetsregisteret",
        source_base_url_env="NORWAY_SOURCE_BASE_URL",
        default_source_base_url=DEFAULT_BASE_URL,
    )
    runner = WorkerRunner(config, fetch_records, normalize_records)

    if args.command == "fetch":
        _, raw_path, raw_count = runner.fetch_only(limit=args.limit)
        print(f"Fetched {raw_count} Norway records -> {raw_path}")
    elif args.command == "normalize":
        records = fetch_records(config, args.limit)
        _, normalized_path, normalized_count = runner.normalize_only(records)
        print(f"Normalized {normalized_count} Norway records -> {normalized_path}")
    elif args.command == "ingest-db":
        result = ingest_to_db(config, limit=args.limit)
        print(f"Ingested {result.written}/{result.seen} Norway records into Postgres")
    else:
        artifacts = runner.run(limit=args.limit)
        print(
            f"Completed Norway worker: raw={artifacts.raw_count} ({artifacts.raw_path}), "
            f"normalized={artifacts.normalized_count} ({artifacts.normalized_path})"
        )


if __name__ == "__main__":
    main()
