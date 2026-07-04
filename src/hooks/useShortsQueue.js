import { useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

const LEGACY_STORAGE_KEY = 'shortsQueueByProject';
const QUEUE_LENGTH = 20;

function normalizeQueueEntry(projectQueue) {
  if (!projectQueue) return { queue: [] };

  const queue = projectQueue.queue || [];
  // Older queues stored full entry snapshots instead of id references.
  const isLegacySnapshotShape = queue.some((item) => typeof item === 'object');

  return {
    queue: isLegacySnapshotShape ? queue.map((item) => getCoverId(item)) : queue,
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

function getCoverId(entry) {
  return entry.id || `${entry.artist?.toLowerCase() || ''}::${entry.song?.toLowerCase() || ''}`;
}

function getRandomEntry(entries) {
  return entries[Math.floor(Math.random() * entries.length)];
}

function isTooClose(queueIds, entry) {
  const entryId = getCoverId(entry);
  const previousTwo = queueIds.slice(-2);

  return previousTwo.includes(entryId);
}

function buildQueue(savedEntries) {
  if (!savedEntries.length) return [];

  const queueIds = [];
  const maxAttempts = QUEUE_LENGTH * 50;

  let attempts = 0;

  while (queueIds.length < QUEUE_LENGTH && attempts < maxAttempts) {
    const candidate = getRandomEntry(savedEntries);

    if (!isTooClose(queueIds, candidate)) {
      queueIds.push(getCoverId(candidate));
    }

    attempts += 1;
  }

  return queueIds;
}

function getValidReplacement(savedEntries, queueIds) {
  const maxAttempts = savedEntries.length * 20;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = getRandomEntry(savedEntries);

    if (!isTooClose(queueIds, candidate)) {
      return getCoverId(candidate);
    }
  }

  return null;
}

export function useShortsQueue(projectId, savedEntries = []) {
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
    const nextQueueIds = buildQueue(getQueueCandidates(savedEntries));
    updateProjectQueue(nextQueueIds);
  }

  function markUploaded(indexToRemove) {
    const nextQueueIds = queueIds.filter((_, index) => index !== indexToRemove);
    const replacement = getValidReplacement(
      getQueueCandidates(savedEntries),
      nextQueueIds,
    );

    if (replacement) {
      nextQueueIds.push(replacement);
    }

    updateProjectQueue(nextQueueIds);
  }

  // Resolve ids to live saved-entry data on every render, so edits made
  // after the queue was randomized (new tags, notes, etc.) always show up.
  const queue = queueIds.map(
    (id) => savedEntries.find((entry) => getCoverId(entry) === id) || null,
  );

  return {
    queue,
    randomizeQueue,
    markUploaded,
  };
}
