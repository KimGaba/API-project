from __future__ import annotations

from company_data_workers.ingest_uk.normalize import normalize_records
from company_data_workers.ingest_uk.source import DEFAULT_BASE_URL, fetch_records
from company_data_workers.shared.config import build_config
from company_data_workers.shared.runner import WorkerRunner, build_parser


def main() -> None:
    parser = build_parser("ingest-uk")
    subparsers = parser._subparsers._group_actions[0]  # type: ignore[attr-defined]
    bulk_parser = subparsers.add_parser(
        "ingest-bulk",
        help="Full sync via Companies House BasicCompanyData bulk CSV (~5M companies)"
    )
    bulk_parser.add_argument("--batch-size", type=int, default=500)

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
    elif args.command == "ingest-bulk":
        from company_data_workers.ingest_uk.db_ingest import ingest_bulk_to_db
        batch_size = getattr(args, "batch_size", 500)
        print(f"Starting UK bulk sync (batch_size={batch_size})...")
        print("Downloading Companies House BasicCompanyData — this takes 5-10 minutes.")
        result = ingest_bulk_to_db(batch_size=batch_size)
        print(f"Bulk sync complete: {result.written:,}/{result.seen:,} companies ingested")
    else:
        artifacts = runner.run(limit=args.limit)
        print(
            f"Completed UK worker: raw={artifacts.raw_count} ({artifacts.raw_path}), "
            f"normalized={artifacts.normalized_count} ({artifacts.normalized_path})"
        )


if __name__ == "__main__":
    main()
