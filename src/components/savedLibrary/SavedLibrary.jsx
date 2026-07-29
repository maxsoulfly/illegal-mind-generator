import { useState } from 'react';

import ToggleButton from '../ui/ToggleButton';
import SavedLibraryItem from './SavedLibraryItem';
import MissingDataTools from './MissingDataTools';
import useSavedLibraryFilters from '../../hooks/useSavedLibraryFilters';

function SavedLibrary({
  savedEntries,
  onLoadEntry,
  onDeleteEntry,
  onExportEntries,
  onImportEntries,
  onUpdateEntry,
  projectConfig,
  showSavedLibrary: controlledShowSavedLibrary,
  setShowSavedLibrary: controlledSetShowSavedLibrary,
}) {
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

  const {
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
  } = useSavedLibraryFilters(savedEntries);

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
              <span className="text-main">{projectConfig.name}</span>{' '}
              <span className="saved-library-count">
                ({filteredEntries.length} / {savedEntries.length} shown)
              </span>
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

                {hasMissingData && (
                  <label className="toggle-row library-sort-toggle">
                    <input
                      className="toggle-checkbox"
                      type="checkbox"
                      checked={missingDataOnly}
                      onChange={(e) => setMissingDataOnly(e.target.checked)}
                    />
                    <span className="toggle-label">Missing Year/Genre</span>
                  </label>
                )}
              </div>

              {hasMissingData && (
                <MissingDataTools
                  missingEntries={missingEntries}
                  savedEntries={savedEntries}
                  onUpdateEntry={onUpdateEntry}
                />
              )}
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
