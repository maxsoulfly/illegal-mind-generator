import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';

// One-time import: the localStorage `uploadCalendar` blob -> Postgres
// `upload_calendar_slots` rows, via the running API's PUT /upload-calendar/slot
// endpoint (one patch per slot; the table starts empty so each PUT is a clean
// insert). Idempotent. The composite FKs on planned_entry_id / uploaded_entry_id
// mean a slot referencing a nonexistent saved_entries row is rejected 400 and
// reported here rather than silently dropped.
// Part of the persistence migration's Step 10
// (see C:\Users\Max\.claude\plans\one-signal-many-terminals.md).
//
// Usage:  node server/imports/0010_upload_calendar_slots.js <backup-export.json>
// Requires the API server running (npm run dev, or npm run dev:server).

const dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(dirname, '..', '.env'), quiet: true });

const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 8787;
const BASE = `http://localhost:${PORT}`;

async function main() {
  const exportPath = process.argv[2];
  if (!exportPath) {
    console.error('Usage: node server/imports/0010_upload_calendar_slots.js <backup-export.json>');
    process.exit(1);
  }
  if (!API_KEY) {
    console.error('API_KEY is not set in server/.env');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const appData = raw.data || raw;
  const uploadCalendar = appData.uploadCalendar || {};

  const projectIds = Object.keys(uploadCalendar);
  if (projectIds.length === 0) {
    console.log('No uploadCalendar found in the export. Nothing to import.');
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const projectId of projectIds) {
    const slots = uploadCalendar[projectId] || {};
    const slotKeys = Object.keys(slots);
    console.log(`\n${projectId}: ${slotKeys.length} slot(s)`);

    for (const slotKey of slotKeys) {
      const sepIndex = slotKey.lastIndexOf('|');
      const isoDate = slotKey.slice(0, sepIndex);
      const videoType = slotKey.slice(sepIndex + 1);
      const { plannedEntryId = null, uploadedEntryId = null } = slots[slotKey] || {};

      if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate) || !videoType) {
        console.error(`  x ${slotKey} - unparseable slotKey`);
        failed += 1;
        continue;
      }

      try {
        const res = await fetch(`${BASE}/upload-calendar/slot`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            projectId,
            isoDate,
            videoType,
            patch: { plannedEntryId, uploadedEntryId },
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`  x ${slotKey} - ${res.status} ${body}`);
          failed += 1;
        } else {
          console.log(`  ok ${slotKey}`);
          ok += 1;
        }
      } catch (error) {
        console.error(`  x ${slotKey} - ${error.message}`);
        failed += 1;
      }
    }
  }

  console.log(`\nDone. ${ok} imported, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
