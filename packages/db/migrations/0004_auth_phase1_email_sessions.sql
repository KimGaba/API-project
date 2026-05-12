-- Phase 1 auth foundation.
-- Extends the existing local user/account/session groundwork so email/password auth
-- can coexist with future Google/GitHub OAuth sign-in.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE users RENAME COLUMN name TO display_name;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  email_verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_normalized CITEXT,
  password_hash TEXT
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_normalized CITEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT;

UPDATE users
SET email_normalized = email
WHERE email_normalized IS NULL;

ALTER TABLE users
  ALTER COLUMN email_normalized SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_normalized_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_normalized_unique UNIQUE (email_normalized);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oauth_accounts')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_identities') THEN
    ALTER TABLE oauth_accounts RENAME TO auth_identities;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT,
  provider_email CITEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_user_id)
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auth_identities' AND column_name = 'provider_account_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auth_identities' AND column_name = 'provider_user_id'
  ) THEN
    ALTER TABLE auth_identities RENAME COLUMN provider_account_id TO provider_user_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auth_identities' AND column_name = 'email'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auth_identities' AND column_name = 'provider_email'
  ) THEN
    ALTER TABLE auth_identities RENAME COLUMN email TO provider_email;
  END IF;
END $$;

ALTER TABLE auth_identities
  ADD COLUMN IF NOT EXISTS provider_user_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_email CITEXT;

ALTER TABLE auth_identities
  DROP COLUMN IF EXISTS access_token_encrypted,
  DROP COLUMN IF EXISTS refresh_token_encrypted,
  DROP COLUMN IF EXISTS token_expires_at,
  DROP COLUMN IF EXISTS id_token_encrypted;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_sessions')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
    ALTER TABLE app_sessions RENAME TO user_sessions;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER INDEX IF EXISTS idx_oauth_accounts_user_id
  RENAME TO idx_auth_identities_user_id;

ALTER INDEX IF EXISTS idx_app_sessions_user_id
  RENAME TO idx_user_sessions_user_id;

ALTER INDEX IF EXISTS idx_app_sessions_customer_id
  RENAME TO idx_user_sessions_customer_id;

ALTER INDEX IF EXISTS idx_app_sessions_expires_at
  RENAME TO idx_user_sessions_expires_at;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'ip_address' AND udt_name = 'inet'
  ) THEN
    ALTER TABLE user_sessions ALTER COLUMN ip_address TYPE TEXT USING ip_address::TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_auth_identities_user_id ON auth_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_identities_provider_user_id
  ON auth_identities(provider, provider_user_id)
  WHERE provider_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_customer_id ON user_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(session_token_hash);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auth_identities_updated_at') THEN
    CREATE TRIGGER trg_auth_identities_updated_at
    BEFORE UPDATE ON auth_identities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

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
