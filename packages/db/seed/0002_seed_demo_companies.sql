INSERT INTO customers (
  email,
  name,
  company_name,
  country_code,
  default_plan,
  status
) VALUES (
  'demo@example.com',
  'Demo Customer',
  'Company Data Demo',
  'GB',
  'free',
  'active'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO subscriptions (
  customer_id,
  plan_name,
  status,
  monthly_quota,
  rpm_limit
)
SELECT
  c.id,
  'free',
  'active',
  1000,
  60
FROM customers c
WHERE c.email = 'demo@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM subscriptions s
    WHERE s.customer_id = c.id
      AND s.plan_name = 'free'
      AND s.status = 'active'
  );

INSERT INTO api_keys (
  customer_id,
  key_prefix,
  key_hash,
  label,
  active
)
SELECT
  c.id,
  'demo_live',
  '50b9c84bb31cc96e6c113f01efdbb08dabd50f6480ab3f31dc44a370fb88fea5',
  'Local demo key',
  TRUE
FROM customers c
WHERE c.email = 'demo@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM api_keys ak
    WHERE ak.key_hash = '50b9c84bb31cc96e6c113f01efdbb08dabd50f6480ab3f31dc44a370fb88fea5'
  );

INSERT INTO companies (
  id,
  canonical_name,
  normalized_name,
  country_code,
  registration_number,
  vat_number,
  legal_form,
  status,
  incorporation_date,
  website,
  source_confidence,
  latest_source_record_at
) VALUES
  (
    gen_random_uuid(),
    'Nordic Data Example AS',
    'nordic data example as',
    'NO',
    '912345678',
    NULL,
    'AS',
    'active',
    '2020-01-01',
    'https://example.no',
    0.95,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Example Analytics Ltd',
    'example analytics ltd',
    'GB',
    '12345678',
    NULL,
    'ltd',
    'active',
    '2019-04-06',
    'https://example.co.uk',
    0.93,
    NOW()
  )
ON CONFLICT DO NOTHING;
