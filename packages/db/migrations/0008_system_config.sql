-- Runtime configuration stored in DB, takes precedence over env vars.
-- Values are plaintext — never store credentials outside of this table without appropriate DB access controls.
CREATE TABLE IF NOT EXISTS system_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
