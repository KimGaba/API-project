from __future__ import annotations

from company_data_workers.ingest_uk.normalize import normalize_records
from company_data_workers.ingest_uk.source import DEFAULT_BASE_URL, fetch_records
from company_data_workers.shared.config import build_config
from company_data_workers.shared.runner import WorkerRunner, build_parser


def main() -> None:
    parser = build_parser("ingest-uk")
    args = parser.parse_args()

    config = build_config(
        country_code="GB",
        source_name="companies-house",
        source_base_url_env="UK_SOURCE_BASE_URL",
        default_source_base_url=DEFAULT_BASE_URL,
    )
    runner = WorkerRunner(config, fetch_records, normalize_records)

    if args.command == "fetch":
        _, raw_path, raw_count = runner.fetch_only(limit=args.limit)
        print(f"Fetched {raw_count} UK records -> {raw_path}")
    elif args.command == "normalize":
        records = fetch_records(config, args.limit)
        _, normalized_path, normalized_count = runner.normalize_only(records)
        print(f"Normalized {normalized_count} UK records -> {normalized_path}")
    else:
        artifacts = runner.run(limit=args.limit)
        print(
            f"Completed UK worker: raw={artifacts.raw_count} ({artifacts.raw_path}), "
            f"normalized={artifacts.normalized_count} ({artifacts.normalized_path})"
        )


if __name__ == "__main__":
    main()
