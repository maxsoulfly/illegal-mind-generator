import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';

// One-time import: the localStorage `savedEntries` blob -> Postgres
// `saved_entries` rows, via the running API's POST /saved-entries/import
// endpoint. That endpoint runs mergeImportedEntry per item — the same
// non-destructive normalization the app's own "Import Library" applies — which
// is what we want here, NOT a raw column-for-column PUT:
//   - legacy customStory / customLogNote (present on ~13 real entries, with no
//     matching songBlockOverrides key) get folded into
//     songBlockOverrides.storyBlock / .logBlock, so their content is preserved
//   - session-only keys (videoType, changesMade, extraVibeNote) are dropped
//     by design (see CLAUDE.md's save/load field list)
// A raw PUT of the export entries would silently lose the legacy story/log
// content on those entries.
//
// Idempotent — re-running merges the same items against the now-existing rows
// (mergeImportedEntry's preferNonEmpty keeps existing non-empty values).
// Part of the persistence migration's Step 9
// (see C:\Users\Max\.claude\plans\one-signal-many-terminals.md).
//
// Usage:  node server/imports/0009_saved_entries.js <backup-export.json>
// Requires the API server running (npm run dev, or npm run dev:server).

const dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(dirname, '..', '.env'), quiet: true });

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 8787;
const BASE = `http://localhost:${PORT}`;

async function main() {
  const exportPath = process.argv[2];
  if (!exportPath) {
    console.error('Usage: node server/imports/0009_saved_entries.js <backup-export.json>');
    process.exit(1);
  }
  if (!API_KEY) {
    console.error('API_KEY is not set in server/.env');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const appData = raw.data || raw;
  const savedEntries = appData.savedEntries || {};

  const projectIds = Object.keys(savedEntries);
  if (projectIds.length === 0) {
    console.log('No savedEntries found in the export. Nothing to import.');
    return;
  }

  let failed = 0;

  for (const projectId of projectIds) {
    const items = savedEntries[projectId] || [];

    try {
      const res = await fetch(`${BASE}/saved-entries/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ projectId, items }),
      });

      const body = await res.json();

      if (!res.ok) {
        console.error(`x ${projectId} - ${res.status} ${JSON.stringify(body)}`);
        failed += 1;
      } else {
        console.log(
          `ok ${projectId}: ${items.length} sent, importedCount ${body.importedCount}, ` +
            `${(body.entries || []).length} rows now in the table`,
        );
      }
    } catch (error) {
      console.error(`x ${projectId} - ${error.message}`);
      failed += 1;
    }
  }

  console.log(failed > 0 ? `\nDone with ${failed} project failure(s).` : '\nDone. All projects imported.');
  if (failed > 0) process.exit(1);
}

main();
