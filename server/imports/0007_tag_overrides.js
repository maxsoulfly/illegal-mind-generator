import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';

// One-time import: the localStorage `tagOverrides` blob -> Postgres
// `tag_overrides` rows, via the running API's PUT /tag-overrides endpoint
// (partial-merge upsert; the table starts empty so each PUT is a clean insert).
// Idempotent — re-running upserts the same rows. Part of the persistence
// migration's Step 7 (see C:\Users\Max\.claude\plans\one-signal-many-terminals.md).
//
// Usage:  node server/imports/0007_tag_overrides.js <backup-export.json>
// Requires the API server running (npm run dev, or npm run dev:server).

const dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(dirname, '..', '.env'), quiet: true });

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 8787;
const BASE = `http://localhost:${PORT}`;

async function main() {
  const exportPath = process.argv[2];
  if (!exportPath) {
    console.error('Usage: node server/imports/0007_tag_overrides.js <backup-export.json>');
    process.exit(1);
  }
  if (!API_KEY) {
    console.error('API_KEY is not set in server/.env');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  // Backup export shape: { version, exportedAt, data: { ...appStorage } }.
  const appData = raw.data || raw;
  const tagOverrides = appData.tagOverrides || {};

  const projectIds = Object.keys(tagOverrides);
  if (projectIds.length === 0) {
    console.log('No tagOverrides found in the export. Nothing to import.');
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const projectId of projectIds) {
    const tags = tagOverrides[projectId] || {};
    const tagNames = Object.keys(tags);
    console.log(`\n${projectId}: ${tagNames.length} tag override(s)`);

    for (const tagName of tagNames) {
      const updates = tags[tagName];
      try {
        const res = await fetch(`${BASE}/tag-overrides`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({ projectId, tagName, updates }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`  x ${tagName} - ${res.status} ${body}`);
          failed += 1;
        } else {
          console.log(`  ok ${tagName}`);
          ok += 1;
        }
      } catch (error) {
        console.error(`  x ${tagName} - ${error.message}`);
        failed += 1;
      }
    }
  }

  console.log(`\nDone. ${ok} imported, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
