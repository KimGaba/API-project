import { query } from '../lib/db.js';

export type Customer = {
  id: string;
  userId: string | null;
  email: string;
  name: string | null;
  defaultPlan: string;
  status: string;
  createdAt: string;
};

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    defaultPlan: String(row.default_plan),
    status: String(row.status),
    createdAt: String(row.created_at),
  };
}

export async function getCustomerByUserId(userId: string): Promise<Customer | null> {
  const result = await query(
    `SELECT id, user_id, email, name, default_plan, status, created_at
     FROM customers WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapCustomer(result.rows[0]) : null;
}

export async function ensureCustomerForUser(input: {
  userId: string;
  email: string;
  displayName?: string | null;
}): Promise<Customer> {
  const result = await query(
    `INSERT INTO customers (user_id, email, name, default_plan, status)
     VALUES ($1, $2, $3, 'free', 'active')
     ON CONFLICT (email) DO UPDATE
       SET user_id = COALESCE(customers.user_id, EXCLUDED.user_id),
           name    = COALESCE(EXCLUDED.name, customers.name),
           updated_at = NOW()
     RETURNING id, user_id, email, name, default_plan, status, created_at`,
    [input.userId, input.email.toLowerCase().trim(), input.displayName?.trim() || null]
  );
  const row = result.rows[0];
  if (!row) throw new Error('Failed to ensure customer');
  return mapCustomer(row);
}
