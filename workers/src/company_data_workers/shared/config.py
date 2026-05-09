from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class WorkerConfig:
    country_code: str
    source_name: str
    source_base_url: str
    output_dir: Path
    timeout_seconds: int = 30
    retries: int = 2

    @property
    def country_output_dir(self) -> Path:
        return self.output_dir / self.country_code.lower()


def build_config(*, country_code: str, source_name: str, source_base_url_env: str, default_source_base_url: str) -> WorkerConfig:
    output_dir = Path(os.getenv("WORKER_OUTPUT_DIR", "/tmp/company-data-workers"))
    timeout_seconds = int(os.getenv("WORKER_HTTP_TIMEOUT_SECONDS", "30"))
    retries = int(os.getenv("WORKER_HTTP_RETRIES", "2"))
    source_base_url = os.getenv(source_base_url_env, default_source_base_url)

    return WorkerConfig(
        country_code=country_code,
        source_name=source_name,
        source_base_url=source_base_url,
        output_dir=output_dir,
        timeout_seconds=timeout_seconds,
        retries=retries,
    )
