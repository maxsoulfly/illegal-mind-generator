import { useMemo, useState, useEffect } from 'react';

import ToggleButton from '../ui/ToggleButton';
import SavedLibraryItem from './SavedLibraryItem';
import { updateAppStorage } from '../../utils/storage';

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

function SavedLibrary({
  savedEntries,
  onLoadEntry,
  onDeleteEntry,
  onExportEntries,
  onImportEntries,
  projectConfig,
  showSavedLibrary: controlledShowSavedLibrary,
  setShowSavedLibrary: controlledSetShowSavedLibrary,
}) {
  const [search, setSearch] = useState('');
  const [internalShowSavedLibrary, setInternalShowSavedLibrary] = useState(
    () => {
      const saved = localStorage.getItem('showSavedLibrary');
      return saved ? JSON.parse(saved) : false;
    },
  );

  const showSavedLibrary =
    controlledShowSavedLibrary ?? internalShowSavedLibrary;

  const setShowSavedLibrary =
    controlledSetShowSavedLibrary ?? setInternalShowSavedLibrary;

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
        if (!missingDataOnly) return true;

        return !entry.originalYear || !entry.originalGenre;
      })
      .sort((a, b) => {
        if (sortBySignal) {
          return Number(a.signalNumber || 0) - Number(b.signalNumber || 0);
        }

        const artistCompare = a.artist.localeCompare(b.artist);
        if (artistCompare !== 0) return artistCompare;

        return a.song.localeCompare(b.song);
      });
  }, [savedEntries, search, sortBySignal, hideQueueHidden, missingDataOnly]);
  return (
    <div>
      <ToggleButton
        isOpen={showSavedLibrary}
        onClick={() => setShowSavedLibrary((prev) => !prev)}
        label="Library"
      />

      {showSavedLibrary && (
        <div className="saved-library-header">
          <div className="panel">
            <h3 className="panel-title">
              Saved Library —{' '}
              <span className="text-main">{projectConfig.name}</span>
            </h3>
            <div className="library-controls">
              <input
                className="form-input"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved songs..."
              />
              <div className="filter-row">
                <label className="toggle-row library-sort-toggle">
                  <input
                    className="toggle-checkbox"
                    type="checkbox"
                    checked={sortBySignal}
                    onChange={(e) => setSortBySignal(e.target.checked)}
                  />
                  <span className="toggle-label">Sort by Signal #</span>
                </label>

                <label className="toggle-row library-sort-toggle">
                  <input
                    className="toggle-checkbox"
                    type="checkbox"
                    checked={hideQueueHidden}
                    onChange={(e) => setHideQueueHidden(e.target.checked)}
                  />
                  <span className="toggle-label">Hide Queue-Hidden</span>
                </label>

                <label className="toggle-row library-sort-toggle">
                  <input
                    className="toggle-checkbox"
                    type="checkbox"
                    checked={missingDataOnly}
                    onChange={(e) => setMissingDataOnly(e.target.checked)}
                  />
                  <span className="toggle-label">Missing Year/Genre</span>
                </label>
              </div>
            </div>

            <div className="saved-library-list">
              {filteredEntries.length === 0 && (
                <p className="output-text">No saved songs found.</p>
              )}

              {filteredEntries.map((entry) => (
                <SavedLibraryItem
                  key={entry.id}
                  entry={entry}
                  onLoadEntry={onLoadEntry}
                  onDeleteEntry={onDeleteEntry}
                />
              ))}
            </div>

            <div className="button-row">
              <button
                type="button"
                className="button-secondary"
                onClick={onExportEntries}
              >
                Export Library
              </button>

              <input
                type="file"
                accept="application/json"
                onChange={onImportEntries}
                style={{ display: 'none' }}
                id="import-library-input"
              />

              <label
                htmlFor="import-library-input"
                className="button-secondary"
              >
                Import Library
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedLibrary;
