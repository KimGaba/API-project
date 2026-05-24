-- Link users ↔ customers so signup can create both in one transaction
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS customers_user_id_unique ON customers(user_id) WHERE user_id IS NOT NULL;
