import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from '../lib/db.js';

const pool = getPool();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../../');
const migrationsDir = path.join(root, 'packages/db/migrations');
const seedDir = path.join(root, 'packages/db/seed');

async function readSqlFiles(directory: string) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();
}

async function ensureMigrationTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('migration', 'seed')),
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function hasApplied(filename: string) {
  const result = await pool.query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE filename = $1) AS exists',
    [filename]
  );

  return Boolean(result.rows[0]?.exists);
}

async function markApplied(filename: string, kind: 'migration' | 'seed') {
  await pool.query(
    'INSERT INTO schema_migrations (filename, kind) VALUES ($1, $2) ON CONFLICT (filename) DO NOTHING',
    [filename, kind]
  );
}

async function applySqlFile(directory: string, file: string, kind: 'migration' | 'seed') {
  if (await hasApplied(file)) {
    console.log(`Skipping already applied ${kind} ${file}`);
    return;
  }

  const sql = await fs.readFile(path.join(directory, file), 'utf8');

  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await markApplied(file, kind);
    await pool.query('COMMIT');
    console.log(`Applied ${kind} ${file}`);
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

async function run() {
  await ensureMigrationTables();

  const migrationFiles = await readSqlFiles(migrationsDir);
  const seedFiles = await readSqlFiles(seedDir);

  for (const file of migrationFiles) {
    await applySqlFile(migrationsDir, file, 'migration');
  }

  for (const file of seedFiles) {
    await applySqlFile(seedDir, file, 'seed');
  }

  await pool.end();
}

run().catch(async (error) => {
  console.error(error);
  await pool?.end();
  process.exit(1);
});
