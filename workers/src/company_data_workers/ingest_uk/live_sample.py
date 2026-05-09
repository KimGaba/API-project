from __future__ import annotations

import argparse
import os
import subprocess
import sys

from company_data_workers.ingest_uk.validation import validate_company_numbers


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate and run a safe UK Companies House live sample")
    parser.add_argument(
        "company_numbers",
        nargs="+",
        help="One or more Companies House company numbers. Numeric values are zero-padded to 8 digits.",
    )
    parser.add_argument("--limit", type=int, default=None, help="Optional limit override; defaults to the number of validated company numbers")
    parser.add_argument("--check-only", action="store_true", help="Validate inputs and environment without running the worker")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    result = validate_company_numbers(args.company_numbers)
    if result.invalid:
        parser.error(
            "Invalid Companies House company number(s): " + ", ".join(result.invalid) + ". Use 1-8 alphanumeric characters; numeric inputs are zero-padded to 8 digits."
        )

    limit = args.limit or len(result.normalized)
    api_key_present = bool(os.getenv("COMPANIES_HOUSE_API_KEY", "").strip())

    print("Validated company numbers: " + ", ".join(result.normalized))
    print(f"COMPANIES_HOUSE_API_KEY present: {'yes' if api_key_present else 'no'}")
    print(f"Suggested UK_COMPANY_NUMBERS={','.join(result.normalized)}")
    print(f"Suggested limit={limit}")

    if args.check_only:
        return

    if not api_key_present:
        parser.error("COMPANIES_HOUSE_API_KEY is required unless using --check-only")

    env = os.environ.copy()
    env["UK_SOURCE_MODE"] = "live"
    env["UK_COMPANY_NUMBERS"] = ",".join(result.normalized)

    command = [
        sys.executable,
        "-m",
        "company_data_workers.ingest_uk.cli",
        "run",
        "--limit",
        str(limit),
    ]
    raise SystemExit(subprocess.call(command, env=env))


if __name__ == "__main__":
    main()
