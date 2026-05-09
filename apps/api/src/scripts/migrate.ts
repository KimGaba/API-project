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

async function run() {
  const migrationFiles = await readSqlFiles(migrationsDir);
  const seedFiles = await readSqlFiles(seedDir);

  for (const file of migrationFiles) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    console.log(`Applied migration ${file}`);
  }

  for (const file of seedFiles) {
    const sql = await fs.readFile(path.join(seedDir, file), 'utf8');
    await pool.query(sql);
    console.log(`Applied seed ${file}`);
  }

  await pool.end();
}

run().catch(async (error) => {
  console.error(error);
  await pool?.end();
  process.exit(1);
});
