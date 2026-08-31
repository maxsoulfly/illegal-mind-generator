import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';

// One-time import: the localStorage `projectOverrides` blob -> Postgres
// `project_overrides` rows, via the running API's PATCH /project-overrides
// endpoint (top-level shallow-merge upsert; the table starts empty so each
// PATCH is a clean insert of the whole settings object). Idempotent.
// Part of the persistence migration's Step 8
// (see C:\Users\Max\.claude\plans\one-signal-many-terminals.md).
//
// Usage:  node server/imports/0008_project_overrides.js <backup-export.json>
// Requires the API server running (npm run dev, or npm run dev:server).

const dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(dirname, '..', '.env'), quiet: true });

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 8787;
const BASE = `http://localhost:${PORT}`;

async function main() {
  const exportPath = process.argv[2];
  if (!exportPath) {
    console.error('Usage: node server/imports/0008_project_overrides.js <backup-export.json>');
    process.exit(1);
  }
  if (!API_KEY) {
    console.error('API_KEY is not set in server/.env');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const appData = raw.data || raw;
  const projectOverrides = appData.projectOverrides || {};

  const projectIds = Object.keys(projectOverrides);
  if (projectIds.length === 0) {
    console.log('No projectOverrides found in the export. Nothing to import.');
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const projectId of projectIds) {
    const settings = projectOverrides[projectId] || {};
    const topKeys = Object.keys(settings);
    try {
      const res = await fetch(`${BASE}/project-overrides`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ projectId, updates: settings }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`x ${projectId} - ${res.status} ${body}`);
        failed += 1;
      } else {
        console.log(`ok ${projectId} (${topKeys.length} top-level keys: ${topKeys.join(', ')})`);
        ok += 1;
      }
    } catch (error) {
      console.error(`x ${projectId} - ${error.message}`);
      failed += 1;
    }
  }

  console.log(`\nDone. ${ok} imported, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
