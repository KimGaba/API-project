from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from company_data_workers.shared.config import WorkerConfig
from company_data_workers.shared.io import write_jsonl
from company_data_workers.shared.models import NormalizedCompany, SourceRecord

FetchFn = Callable[[WorkerConfig, int], list[SourceRecord]]
NormalizeFn = Callable[[list[SourceRecord]], list[NormalizedCompany]]


@dataclass(frozen=True)
class RunArtifacts:
    raw_path: Path
    normalized_path: Path
    raw_count: int
    normalized_count: int


class WorkerRunner:
    def __init__(self, config: WorkerConfig, fetch_fn: FetchFn, normalize_fn: NormalizeFn) -> None:
        self.config = config
        self.fetch_fn = fetch_fn
        self.normalize_fn = normalize_fn

    def fetch_only(self, *, limit: int) -> tuple[list[SourceRecord], Path, int]:
        records = self.fetch_fn(self.config, limit)
        raw_path = self.config.country_output_dir / "raw.jsonl"
        raw_count = write_jsonl(raw_path, (record.to_dict() for record in records))
        return records, raw_path, raw_count

    def normalize_only(self, records: list[SourceRecord]) -> tuple[list[NormalizedCompany], Path, int]:
        normalized = self.normalize_fn(records)
        normalized_path = self.config.country_output_dir / "normalized.jsonl"
        normalized_count = write_jsonl(normalized_path, (row.to_dict() for row in normalized))
        return normalized, normalized_path, normalized_count

    def run(self, *, limit: int) -> RunArtifacts:
        records, raw_path, raw_count = self.fetch_only(limit=limit)
        _, normalized_path, normalized_count = self.normalize_only(records)
        return RunArtifacts(
            raw_path=raw_path,
            normalized_path=normalized_path,
            raw_count=raw_count,
            normalized_count=normalized_count,
        )


def build_parser(worker_name: str) -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=f"Run {worker_name} worker")
    subparsers = parser.add_subparsers(dest="command", required=True)

    for command in ("fetch", "normalize", "run", "ingest-db"):
        command_parser = subparsers.add_parser(command)
        command_parser.add_argument("--limit", type=int, default=5, help="Number of records to process")
        command_parser.add_argument(
            "--start-page",
            type=int,
            default=None,
            help="Optional page offset for sources that support paged live fetches",
        )
        command_parser.add_argument(
            "--page-size",
            type=int,
            default=None,
            help="Optional per-page fetch size for sources that support paged live fetches",
        )
        command_parser.add_argument(
            "--max-pages",
            type=int,
            default=None,
            help="Optional cap on how many live pages to fetch in one run",
        )

    return parser
