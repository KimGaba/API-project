# UK Live Test Runbook

This is the safe path for testing the official Companies House integration without putting secrets into source code.

## Goal

Fetch a tiny, explicit live sample from the Companies House Company Profile API once a real API key is available.

## Preconditions

- You have a valid `COMPANIES_HOUSE_API_KEY`
- You are inside `company-data-project/workers`
- You only plan to fetch a small set of known company numbers

## Recommended sample inputs

Use explicit company numbers rather than discovery or scraping.

Examples:
- `6` -> normalized to `00000006`
- `7` -> normalized to `00000007`
- alphanumeric values are uppercased and validated

## One-time local setup

```bash
cd workers
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
```

## Secret handling

Do **not** hardcode the API key in Python, shell scripts committed to git, or docs examples.

Preferred options:
- export it in your current shell session
- store it in an uncommitted local env file
- inject it via your container/runtime secret mechanism later

Example shell export:

```bash
export COMPANIES_HOUSE_API_KEY=your_real_key_here
```

## Validate before calling the API

```bash
python -m company_data_workers.ingest_uk.live_sample 6 7 --check-only
```

What this checks:
- company numbers are valid
- numeric IDs are normalized to 8 digits
- duplicates are removed
- whether `COMPANIES_HOUSE_API_KEY` is present

Expected output shape:
- validated company numbers
- whether the API key is present
- the exact `UK_COMPANY_NUMBERS` value that would be used
- the effective limit

## Run a tiny live sample

```bash
python -m company_data_workers.ingest_uk.live_sample 6 7
```

This helper:
- validates input first
- sets `UK_SOURCE_MODE=live`
- sets `UK_COMPANY_NUMBERS=00000006,00000007`
- runs `python -m company_data_workers.ingest_uk.cli run --limit 2`

## Equivalent manual command

```bash
UK_SOURCE_MODE=live \
UK_COMPANY_NUMBERS=00000006,00000007 \
python -m company_data_workers.ingest_uk.cli run --limit 2
```

That manual form still requires `COMPANIES_HOUSE_API_KEY` to already be present in the environment.

## Output artifacts

Default output location:
- `/tmp/company-data-workers/gb/raw.jsonl`
- `/tmp/company-data-workers/gb/normalized.jsonl`

If `WORKER_OUTPUT_DIR` is set, outputs land under `<WORKER_OUTPUT_DIR>/gb/`.

## Troubleshooting

### `COMPANIES_HOUSE_API_KEY is required`
Set the key in your shell and rerun.

### `UK_COMPANY_NUMBERS contains invalid values`
Use 1-8 alphanumeric company numbers only. Numeric values can be entered without leading zeroes.

### HTTP 401 / 403
The key is missing, invalid, or not being passed through the current shell/container environment.

### HTTP 404
The company number may be invalid, inactive in the selected endpoint, or mistyped.

## Practical next step after first successful live sample

Once a real sample succeeds, the next useful move is to load the normalized result into Postgres so API search stops depending only on seed fixtures.
