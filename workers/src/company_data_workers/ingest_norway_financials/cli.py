from __future__ import annotations

import argparse

from company_data_workers.ingest_norway_financials.db_ingest import ingest_financials


def main() -> None:
    parser = argparse.ArgumentParser(description="Norway Regnskapsregisteret financial ingest")
    parser.add_argument(
        "--batch-size", type=int, default=200,
        help="Number of reports to commit per DB transaction (default 200)"
    )
    args = parser.parse_args()

    print(f"Starting Norway financials sync (batch_size={args.batch_size})...")
    result = ingest_financials(batch_size=args.batch_size)
    print(
        f"Done: {result.fetched:,} fetched, "
        f"{result.written:,} written, "
        f"{result.skipped:,} skipped (not in DB)"
    )


if __name__ == "__main__":
    main()
