from __future__ import annotations

from company_data_workers.ingest_finland.db_ingest import ingest_bulk_to_db


def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="Finland PRH company ingest")
    sub = parser.add_subparsers(dest="command")
    bulk = sub.add_parser("ingest-bulk", help="Full sync of all ~818K Finnish companies")
    bulk.add_argument("--batch-size", type=int, default=500)
    args = parser.parse_args()

    if args.command == "ingest-bulk":
        print("Starting full Finland bulk sync (~818K companies, ~55 min)...")
        result = ingest_bulk_to_db(batch_size=args.batch_size)
        print(f"Done: {result.written:,}/{result.seen:,} companies written to Postgres")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
