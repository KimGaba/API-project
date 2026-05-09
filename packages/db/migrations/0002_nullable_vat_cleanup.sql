ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_country_vat_unique;

ALTER TABLE companies
  ADD CONSTRAINT companies_country_vat_unique UNIQUE (country_code, vat_number);

ALTER TABLE companies
  DROP CONSTRAINT IF EXISTS companies_country_registration_unique;

ALTER TABLE companies
  ADD CONSTRAINT companies_country_registration_unique UNIQUE (country_code, registration_number);

UPDATE companies
SET vat_number = NULL
WHERE vat_number LIKE 'no-vat-pending:%';
