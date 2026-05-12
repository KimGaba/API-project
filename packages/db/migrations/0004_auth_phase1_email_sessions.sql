-- Phase 1 auth foundation.
-- Extends the existing local user/account/session groundwork so email/password auth
-- can coexist with future Google/GitHub OAuth sign-in.

ALTER TABLE users
  RENAME COLUMN name TO display_name;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_normalized CITEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

UPDATE users
SET email_normalized = email
WHERE email_normalized IS NULL;

ALTER TABLE users
  ALTER COLUMN email_normalized SET NOT NULL;

ALTER TABLE users
  ADD CONSTRAINT users_email_normalized_unique UNIQUE (email_normalized);

ALTER TABLE oauth_accounts
  RENAME TO auth_identities;

ALTER TABLE auth_identities
  RENAME COLUMN provider_account_id TO provider_user_id;

ALTER TABLE auth_identities
  RENAME COLUMN email TO provider_email;

ALTER TABLE auth_identities
  DROP COLUMN IF EXISTS access_token_encrypted,
  DROP COLUMN IF EXISTS refresh_token_encrypted,
  DROP COLUMN IF EXISTS token_expires_at,
  DROP COLUMN IF EXISTS id_token_encrypted;

ALTER TABLE app_sessions
  RENAME TO user_sessions;

ALTER INDEX IF EXISTS idx_oauth_accounts_user_id
  RENAME TO idx_auth_identities_user_id;

ALTER INDEX IF EXISTS idx_app_sessions_user_id
  RENAME TO idx_user_sessions_user_id;

ALTER INDEX IF EXISTS idx_app_sessions_customer_id
  RENAME TO idx_user_sessions_customer_id;

ALTER INDEX IF EXISTS idx_app_sessions_expires_at
  RENAME TO idx_user_sessions_expires_at;

ALTER TABLE user_sessions
  ALTER COLUMN ip_address TYPE TEXT USING ip_address::TEXT;

CREATE INDEX IF NOT EXISTS idx_auth_identities_provider_user_id
  ON auth_identities(provider, provider_user_id)
  WHERE provider_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash
  ON user_sessions(session_token_hash);

INSERT INTO auth_identities (user_id, provider, provider_user_id, provider_email)
SELECT
  u.id,
  'email',
  NULL,
  u.email
FROM users u
WHERE NOT EXISTS (
  SELECT 1
  FROM auth_identities ai
  WHERE ai.user_id = u.id AND ai.provider = 'email'
);
