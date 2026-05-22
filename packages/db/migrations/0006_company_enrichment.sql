-- Fase 1: enrichment columns on companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS employee_count       INT,
  ADD COLUMN IF NOT EXISTS share_capital        NUMERIC(20,2),
  ADD COLUMN IF NOT EXISTS share_capital_currency CHAR(3);

-- Fase 2: annual financial reports
CREATE TABLE IF NOT EXISTS company_financials (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_id           UUID REFERENCES source_registry(id) ON DELETE SET NULL,
  report_year         INT  NOT NULL,
  revenue             NUMERIC(20,2),
  operating_result    NUMERIC(20,2),
  equity              NUMERIC(20,2),
  currency            CHAR(3) NOT NULL DEFAULT 'NOK',
  fetched_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT company_financials_company_year_unique UNIQUE (company_id, report_year)
);

CREATE INDEX IF NOT EXISTS idx_company_financials_company_id   ON company_financials(company_id);
CREATE INDEX IF NOT EXISTS idx_company_financials_year         ON company_financials(company_id, report_year DESC);
