import { useMemo, useState } from 'react';

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

export function useShortsQueue(projectId, savedEntries = []) {
  const storedQueues = useMemo(() => getStoredQueues(), []);

  const [queue, setQueue] = useState(() => {
    return storedQueues[projectId]?.queue || [];
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

  function randomizeQueue() {
    const nextQueue = buildQueue(savedEntries);
    updateProjectQueue(nextQueue);
  }

  return {
    queue,
    randomizeQueue,
  };
}
