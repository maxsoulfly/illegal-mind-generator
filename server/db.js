import pg from 'pg';

const { Pool, types } = pg;

// node-postgres returns DATE columns as JS Date objects by default, which
// invites timezone bugs — a stored calendar date can shift by a day when
// converted back to a string depending on the process's local timezone.
// Every date this app stores (upload_calendar_slots.iso_date) is a plain
// YYYY-MM-DD calendar date, never a timestamp, so return it as the exact
// string Postgres sends and skip Date conversion entirely. OID 1082 = date.
types.setTypeParser(1082, (value) => value);

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
