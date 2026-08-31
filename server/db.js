import pg from 'pg';

const { Pool } = pg;

let pool = null;

// Lazy — returns null until DATABASE_URL is configured, so the rest of the
// server can run and be verified (auth, routing) before a Neon project
// exists yet. Once DATABASE_URL is set, this starts returning a real pool
// with no other code changes needed.
export function getPool() {
  if (!process.env.DATABASE_URL) return null;

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  return pool;
}
