import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';

import { requireApiKey } from './authMiddleware.js';
import { getPool } from './db.js';

// Loads server/.env explicitly (not the repo-root .env Vite reads), so
// server secrets never depend on which directory the process was started
// from and never collide with Vite's own VITE_-prefixed env handling.
config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env'), quiet: true });

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

// Unauthenticated on purpose — a trivial liveness probe. Everything else
// mounted later in this migration requires requireApiKey.
app.get('/', (req, res) => {
  res.json({ name: 'illegal-mind-generator API', status: 'ok' });
});

app.get('/health', requireApiKey, async (req, res) => {
  const pool = getPool();

  if (!pool) {
    res.json({ status: 'ok', db: 'not configured' });
    return;
  }

  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'unreachable', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
