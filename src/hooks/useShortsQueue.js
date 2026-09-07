import { useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

const LEGACY_STORAGE_KEY = 'shortsQueueByProject';
const DEFAULT_QUEUE_LENGTH = 20;
const DEFAULT_DUPLICATE_SPACING = 2;

function normalizeQueueEntry(projectQueue) {
  if (!projectQueue) return { queue: [] };

  const queue = projectQueue.queue || [];
  // Older queues stored full entry snapshots instead of id references.
  const isLegacySnapshotShape = queue.some((item) => typeof item === 'object');

  return {
    queue: isLegacySnapshotShape
      ? queue.map((item) => getCoverId(item)).filter(Boolean)
      : queue,
  };
}

function getStoredQueues() {
  const unified = loadAppStorage().shortsQueues;

  const source =
    unified && Object.keys(unified).length > 0
      ? unified
      : (() => {
          let legacy;

          try {
            legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)) || {};
          } catch {
            return {};
          }

          if (Object.keys(legacy).length > 0) {
            updateAppStorage((storage) => ({ ...storage, shortsQueues: legacy }));
          }

          return legacy;
        })();

  const normalized = Object.fromEntries(
    Object.entries(source).map(([projectId, projectQueue]) => [
      projectId,
      normalizeQueueEntry(projectQueue),
    ]),
  );

  return normalized;
}

function saveStoredQueues(queues) {
  updateAppStorage((storage) => ({ ...storage, shortsQueues: queues }));
}

// Identity for a queued cover is the saved entry's immutable UUID. The old
// `artist::song` fallback identity scheme is gone (Stage 3 identity refactor).
function getCoverId(entry) {
  return entry?.id || null;
}

// Transitional read compatibility: the persisted localStorage queue may still
// hold OLD derived text ids (normalized Artist+Song) written before the UUID
// cutover. Resolve such an id to the entry's real UUID via `matchKey`. A
// value that is already a live UUID, or that matches nothing, is returned
// unchanged. New queue writes only ever use UUIDs, so old ids disappear as
// items are removed / replaced / re-randomized normally — no localStorage
// write-time migration.
function canonicalCoverId(savedEntries, queueId) {
  if (!queueId) return queueId;
  if (savedEntries.some((entry) => entry.id === queueId)) return queueId;
  const byMatchKey = savedEntries.find((entry) => entry.matchKey === queueId);
  return byMatchKey ? byMatchKey.id : queueId;
}

function getRandomEntry(entries) {
  return entries[Math.floor(Math.random() * entries.length)];
}

function isTooClose(queueIds, entry, spacing) {
  const entryId = getCoverId(entry);
  const recent = queueIds.slice(-spacing);

  return recent.includes(entryId);
}

function buildQueue(savedEntries, queueLength, spacing) {
  if (!savedEntries.length) return [];

  const queueIds = [];
  const maxAttempts = queueLength * 50;

  let attempts = 0;

  while (queueIds.length < queueLength && attempts < maxAttempts) {
    const candidate = getRandomEntry(savedEntries);

    if (!isTooClose(queueIds, candidate, spacing)) {
      queueIds.push(getCoverId(candidate));
    }

    attempts += 1;
  }

  return queueIds;
}

function getValidReplacement(savedEntries, queueIds, spacing) {
  const maxAttempts = savedEntries.length * 20;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = getRandomEntry(savedEntries);

    if (!isTooClose(queueIds, candidate, spacing)) {
      return getCoverId(candidate);
    }
  }

  return null;
}

export function useShortsQueue(projectId, savedEntries = [], queueConfig = {}) {
  const queueLength = queueConfig.length ?? DEFAULT_QUEUE_LENGTH;
  const duplicateSpacing = queueConfig.duplicateSpacing ?? DEFAULT_DUPLICATE_SPACING;

  const [queueIds, setQueueIds] = useState(() => {
    return getStoredQueues()[projectId]?.queue || [];
  });

  function updateProjectQueue(nextQueueIds) {
    const latestQueues = getStoredQueues();

    const nextQueues = {
      ...latestQueues,
      [projectId]: {
        queue: nextQueueIds,
      },
    };

    saveStoredQueues(nextQueues);
    setQueueIds(nextQueueIds);
  }

  function getQueueCandidates(savedEntries) {
    return savedEntries.filter((entry) => !entry.excludeFromRandomizer);
  }

  function randomizeQueue() {
    const nextQueueIds = buildQueue(getQueueCandidates(savedEntries), queueLength, duplicateSpacing);
    updateProjectQueue(nextQueueIds);
  }

  function markUploaded(indexToRemove) {
    // Canonicalize any surviving legacy (Artist+Song) queue ids to real UUIDs
    // for the spacing check + persisted result, so removing one item can't
    // leave a mixed id scheme behind. The replacement is always a UUID.
    const nextQueueIds = queueIds
      .filter((_, index) => index !== indexToRemove)
      .map((id) => canonicalCoverId(savedEntries, id));

    const replacement = getValidReplacement(
      getQueueCandidates(savedEntries),
      nextQueueIds,
      duplicateSpacing,
    );

    if (replacement) {
      nextQueueIds.push(replacement);
    }

    updateProjectQueue(nextQueueIds);
  }

  // Resolve ids to live saved-entry data on every render, so edits made
  // after the queue was randomized (new tags, notes, etc.) always show up.
  // Try the UUID identity first, then fall back to matching a legacy derived
  // id against the entry's matchKey (transitional — see canonicalCoverId).
  const queue = queueIds.map(
    (id) =>
      savedEntries.find((entry) => entry.id === id) ||
      savedEntries.find((entry) => entry.matchKey === id) ||
      null,
  );

  return {
    queue,
    queueLength,
    randomizeQueue,
    markUploaded,
  };
}
