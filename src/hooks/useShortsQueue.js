import { useState } from 'react';

const STORAGE_KEY = 'shortsQueueByProject';
const QUEUE_LENGTH = 20;

function getStoredQueues() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStoredQueues(queues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queues));
}

function getCoverId(entry) {
  return `${entry.artist?.toLowerCase() || ''}::${entry.song?.toLowerCase() || ''}`;
}

function getRandomEntry(entries) {
  return entries[Math.floor(Math.random() * entries.length)];
}

function isTooClose(queue, entry) {
  const entryId = getCoverId(entry);
  const previousTwo = queue.slice(-2);

  return previousTwo.some((queuedEntry) => getCoverId(queuedEntry) === entryId);
}

function buildQueue(savedEntries) {
  if (!savedEntries.length) return [];

  const queue = [];
  const maxAttempts = QUEUE_LENGTH * 50;

  let attempts = 0;

  while (queue.length < QUEUE_LENGTH && attempts < maxAttempts) {
    const candidate = getRandomEntry(savedEntries);

    if (!isTooClose(queue, candidate)) {
      queue.push(candidate);
    }

    attempts += 1;
  }

  return queue;
}

function getValidReplacement(savedEntries, queue) {
  const maxAttempts = savedEntries.length * 20;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = getRandomEntry(savedEntries);

    if (!isTooClose(queue, candidate)) {
      return candidate;
    }
  }

  return null;
}

export function useShortsQueue(projectId, savedEntries = []) {
  const [queue, setQueue] = useState(() => {
    return getStoredQueues()[projectId]?.queue || [];
  });
  function updateProjectQueue(nextQueue) {
    const latestQueues = getStoredQueues();

    const nextQueues = {
      ...latestQueues,
      [projectId]: {
        queue: nextQueue,
      },
    };

    saveStoredQueues(nextQueues);
    setQueue(nextQueue);
  }

  function getQueueCandidates(savedEntries) {
    return savedEntries.filter((entry) => !entry.excludeFromRandomizer);
  }

  function randomizeQueue() {
    const nextQueue = buildQueue(getQueueCandidates(savedEntries));
    updateProjectQueue(nextQueue);
  }

  function markUploaded(indexToRemove) {
    const nextQueue = queue.filter((_, index) => index !== indexToRemove);
    const replacement = getValidReplacement(
      getQueueCandidates(savedEntries),
      nextQueue,
    );

    if (replacement) {
      nextQueue.push(replacement);
    }

    updateProjectQueue(nextQueue);
  }

  return {
    queue,
    randomizeQueue,
    markUploaded,
  };
}
