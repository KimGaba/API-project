INSERT INTO source_registry (
  source_code,
  source_name,
  country_code,
  legal_owner,
  access_method,
  base_url,
  license_tag,
  commercial_reuse_allowed,
  attribution_required,
  update_cadence,
  coverage_notes
) VALUES
  (
    'uk_companies_house',
    'UK Companies House',
    'GB',
    'Companies House',
    'api',
    'https://developer.company-information.service.gov.uk/',
    'check-license-before-distribution',
    FALSE,
    TRUE,
    'daily',
    'Core company profile and officers for MVP lookup.'
  ),
  (
    'no_brreg',
    'Norway Brønnøysund Register Centre',
    'NO',
    'Brønnøysundregistrene',
    'api',
    'https://data.brreg.no/enhetsregisteret/api/',
    'nlod-2.0-review',
    TRUE,
    TRUE,
    'daily',
    'Entity registry suitable for MVP ingestion after license confirmation.'
  )
ON CONFLICT (source_code) DO NOTHING;
