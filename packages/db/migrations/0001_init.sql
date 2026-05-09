CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE company_status AS ENUM (
  'active',
  'inactive',
  'dissolved',
  'liquidation',
  'bankruptcy',
  'unknown'
);

CREATE TYPE identifier_type AS ENUM (
  'registration_number',
  'vat_number',
  'lei',
  'duns',
  'tax_number',
  'other'
);

CREATE TYPE address_type AS ENUM (
  'registered',
  'trading',
  'mailing',
  'other'
);

CREATE TYPE plan_name AS ENUM (
  'free',
  'starter',
  'growth',
  'enterprise'
);

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'inactive'
);

CREATE TYPE ingestion_run_status AS ENUM (
  'queued',
  'running',
  'succeeded',
  'failed',
  'partial'
);

CREATE TABLE source_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_code TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  legal_owner TEXT,
  access_method TEXT NOT NULL,
  base_url TEXT,
  license_tag TEXT NOT NULL,
  commercial_reuse_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  attribution_required BOOLEAN NOT NULL DEFAULT FALSE,
  update_cadence TEXT,
  coverage_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES source_registry(id) ON DELETE RESTRICT,
  run_type TEXT NOT NULL,
  status ingestion_run_status NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  checkpoint TEXT,
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_written INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE raw_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES source_registry(id) ON DELETE RESTRICT,
  ingestion_run_id UUID REFERENCES ingestion_runs(id) ON DELETE SET NULL,
  artifact_type TEXT NOT NULL,
  storage_uri TEXT NOT NULL,
  content_hash TEXT,
  content_encoding TEXT,
  byte_size BIGINT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  registration_number TEXT,
  vat_number TEXT,
  legal_form TEXT,
  status company_status NOT NULL DEFAULT 'unknown',
  incorporation_date DATE,
  dissolution_date DATE,
  website TEXT,
  source_confidence NUMERIC(5,2),
  latest_source_id UUID REFERENCES source_registry(id) ON DELETE SET NULL,
  latest_source_record_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT companies_country_registration_unique UNIQUE (country_code, registration_number),
  CONSTRAINT companies_country_vat_unique UNIQUE (country_code, vat_number)
);

CREATE TABLE company_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  identifier_type identifier_type NOT NULL,
  identifier_value TEXT NOT NULL,
  country_code CHAR(2),
  source_id UUID REFERENCES source_registry(id) ON DELETE SET NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT company_identifiers_type_value_country_unique UNIQUE NULLS NOT DISTINCT (identifier_type, identifier_value, country_code)
);

CREATE TABLE company_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  address_type address_type NOT NULL DEFAULT 'registered',
  line1 TEXT,
  line2 TEXT,
  city TEXT,
  postal_code TEXT,
  region TEXT,
  country_code CHAR(2) NOT NULL,
  raw_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE company_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code_system TEXT NOT NULL,
  activity_code TEXT NOT NULL,
  activity_description TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, code_system, activity_code)
);

CREATE TABLE company_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  officer_name TEXT NOT NULL,
  role TEXT,
  start_date DATE,
  end_date DATE,
  source_id UUID REFERENCES source_registry(id) ON DELETE SET NULL,
  source_person_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE source_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES source_registry(id) ON DELETE RESTRICT,
  source_record_id TEXT NOT NULL,
  source_record_hash TEXT,
  raw_payload JSONB,
  extracted_payload JSONB,
  fetched_at TIMESTAMPTZ NOT NULL,
  license_tag TEXT NOT NULL,
  confidence_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, source_record_id)
);

CREATE TABLE change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_id UUID REFERENCES source_registry(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  name TEXT,
  company_name TEXT,
  country_code CHAR(2),
  stripe_customer_id TEXT UNIQUE,
  default_plan plan_name NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_name plan_name NOT NULL,
  status subscription_status NOT NULL DEFAULT 'inactive',
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  monthly_quota INTEGER NOT NULL,
  rpm_limit INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  search_requests INTEGER NOT NULL DEFAULT 0,
  lookup_requests INTEGER NOT NULL DEFAULT 0,
  changes_requests INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, api_key_id, period_start, period_end)
);

CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  period_month DATE NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, external_event_id)
);

CREATE INDEX idx_companies_country_code ON companies(country_code);
CREATE INDEX idx_companies_registration_number ON companies(registration_number) WHERE registration_number IS NOT NULL;
CREATE INDEX idx_companies_vat_number ON companies(vat_number) WHERE vat_number IS NOT NULL;
CREATE INDEX idx_companies_normalized_name_trgm ON companies USING gin (normalized_name gin_trgm_ops);
CREATE INDEX idx_company_identifiers_type_value ON company_identifiers(identifier_type, identifier_value);
CREATE INDEX idx_company_addresses_company_id ON company_addresses(company_id);
CREATE INDEX idx_company_activities_company_id ON company_activities(company_id);
CREATE INDEX idx_company_officers_company_id ON company_officers(company_id);
CREATE INDEX idx_source_records_company_id ON source_records(company_id);
CREATE INDEX idx_source_records_source_id_fetched_at ON source_records(source_id, fetched_at DESC);
CREATE INDEX idx_change_log_company_id_changed_at ON change_log(company_id, changed_at DESC);
CREATE INDEX idx_ingestion_runs_source_id_created_at ON ingestion_runs(source_id, created_at DESC);
CREATE INDEX idx_raw_artifacts_source_id_fetched_at ON raw_artifacts(source_id, fetched_at DESC);
CREATE INDEX idx_api_keys_customer_id_active ON api_keys(customer_id, active);
CREATE INDEX idx_usage_counters_customer_period ON usage_counters(customer_id, period_start, period_end);
CREATE INDEX idx_usage_events_customer_period_month ON usage_events(customer_id, period_month);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_source_registry_updated_at
BEFORE UPDATE ON source_registry
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_usage_counters_updated_at
BEFORE UPDATE ON usage_counters
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
