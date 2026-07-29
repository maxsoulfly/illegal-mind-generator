import { useCallback, useEffect, useMemo, useState } from 'react';

import { updateAppStorage } from '../utils/storage';

// Unified storage applies a default for ui.hideQueueHidden, so a plain
// loadAppStorage() read can't tell "never set" apart from "explicitly false".
// Read the raw stored JSON instead to check whether it was actually written.
function readRawUnifiedUi() {
  try {
    return JSON.parse(localStorage.getItem('illegalMindGeneratorData'))?.ui;
  } catch {
    return undefined;
  }
}

function isMissingData(entry) {
  return !entry.originalYear || !entry.originalGenre;
}

export default function useSavedLibraryFilters(savedEntries) {
  const [search, setSearch] = useState('');
  const [sortBySignal, setSortBySignal] = useState(false);
  const [missingDataOnly, setMissingDataOnly] = useState(false);
  const [hideQueueHidden, setHideQueueHidden] = useState(() => {
    const ui = readRawUnifiedUi();

    if (typeof ui?.hideQueueHidden === 'boolean') {
      return ui.hideQueueHidden;
    }

    const saved = localStorage.getItem('hideQueueHidden');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        hideQueueHidden,
      },
    }));
  }, [hideQueueHidden]);

  const hasMissingData = savedEntries.some(isMissingData);
  const effectiveMissingDataOnly = missingDataOnly && hasMissingData;

  const compareEntries = useCallback(
    (a, b) => {
      if (sortBySignal) {
        return Number(a.signalNumber || 0) - Number(b.signalNumber || 0);
      }

      const artistCompare = a.artist.localeCompare(b.artist);
      if (artistCompare !== 0) return artistCompare;

      return a.song.localeCompare(b.song);
    },
    [sortBySignal],
  );

  const filteredEntries = useMemo(() => {
    const q = search.toLowerCase().trim();

    return [...savedEntries]
      .filter((entry) => {
        if (!q) return true;

        return (
          entry.artist.toLowerCase().includes(q) ||
          entry.song.toLowerCase().includes(q)
        );
      })
      .filter((entry) => {
        if (!hideQueueHidden) return true;

        return !entry.excludeFromRandomizer;
      })
      .filter((entry) => {
        if (!effectiveMissingDataOnly) return true;

        return isMissingData(entry);
      })
      .sort(compareEntries);
  }, [savedEntries, search, hideQueueHidden, effectiveMissingDataOnly, compareEntries]);

  // Project-wide (ignores the search box) — feeds the AI-prompt batch, which
  // should surface all missing songs regardless of what's currently searched.
  const missingEntries = useMemo(
    () => [...savedEntries].filter(isMissingData).sort(compareEntries),
    [savedEntries, compareEntries],
  );

  return {
    search,
    setSearch,
    sortBySignal,
    setSortBySignal,
    hideQueueHidden,
    setHideQueueHidden,
    missingDataOnly,
    setMissingDataOnly,
    hasMissingData,
    filteredEntries,
    missingEntries,
  };
}
