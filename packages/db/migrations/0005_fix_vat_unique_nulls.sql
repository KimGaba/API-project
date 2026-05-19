-- The NULLS NOT DISTINCT behaviour on companies_country_vat_unique means all rows
-- with a null vat_number collide. Replace with a partial unique index that only
-- enforces uniqueness when vat_number is actually set.
ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_country_vat_unique;

CREATE UNIQUE INDEX companies_country_vat_unique
  ON companies (country_code, vat_number)
  WHERE vat_number IS NOT NULL;
