import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';
import pg from 'pg';

const dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(dirname, '.env'), quiet: true });

const { Pool } = pg;

// Minimal, dependency-free migration runner — a folder of plain numbered
// .sql files plus a schema_migrations table tracking which have already run.
// Deliberately not a framework: this migration adds one small table at a
// time (see the plan's Step-by-step sequence), and each step's own .sql file
// is meant to be read directly, not hidden behind tooling. Safe to re-run —
// already-applied files are skipped, so a session that stops mid-step can
// just run `npm run migrate` again next time with no special handling.
async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      'DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in first.',
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const migrationsDir = path.join(dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const { rows: appliedRows } = await pool.query('SELECT id FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.id));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`apply ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`FAILED ${file}:`, error.message);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log('Migrations up to date.');
}

main();
