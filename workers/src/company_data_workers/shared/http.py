from __future__ import annotations

from typing import Any

import requests
from requests import Response, Session
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from company_data_workers.shared.config import WorkerConfig


class HttpClient:
    def __init__(self, config: WorkerConfig, *, headers: dict[str, str] | None = None) -> None:
        self.config = config
        self.session = Session()
        retry = Retry(
            total=config.retries,
            backoff_factor=0.5,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=("GET",),
        )
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        if headers:
            self.session.headers.update(headers)

    def get_json(self, url: str, *, params: dict[str, Any] | None = None) -> Any:
        response = self.get(url, params=params)
        return response.json()

    def get(self, url: str, *, params: dict[str, Any] | None = None) -> Response:
        response = self.session.get(url, params=params, timeout=self.config.timeout_seconds)
        response.raise_for_status()
        return response
