import { Pool, type QueryResultRow } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : null;

export function getPool(): Pool {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured');
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}
