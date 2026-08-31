// Intentional temporary duplicate of the pure replacement-finding logic in
// src/hooks/useShortsQueue.js (getCoverId/isTooClose/getRandomEntry/
// getValidReplacement/getQueueCandidates). Phase A makes zero changes to
// src/ on purpose (see the persistence plan's migration execution
// constraint) — this is copied rather than imported so this step doesn't
// touch app code at all. Consolidate into one shared module when Step 11
// touches useShortsQueue.js for the real hook swap.

export function getCoverId(entry) {
  return entry.id || `${entry.artist?.toLowerCase() || ''}::${entry.song?.toLowerCase() || ''}`;
}

function getRandomEntry(entries) {
  return entries[Math.floor(Math.random() * entries.length)];
}

function isTooClose(queueIds, entry, spacing) {
  const entryId = getCoverId(entry);
  const recent = queueIds.slice(-spacing);

  return recent.includes(entryId);
}

export function getValidReplacement(savedEntries, queueIds, spacing) {
  const maxAttempts = savedEntries.length * 20;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = getRandomEntry(savedEntries);

    if (!isTooClose(queueIds, candidate, spacing)) {
      return getCoverId(candidate);
    }
  }

  return null;
}

export function getQueueCandidates(savedEntries) {
  return savedEntries.filter((entry) => !entry.excludeFromRandomizer);
}
