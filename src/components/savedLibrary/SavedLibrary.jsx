import { useCallback, useMemo, useState, useEffect } from 'react';

import ToggleButton from '../ui/ToggleButton';
import SavedLibraryItem from './SavedLibraryItem';
import { updateAppStorage } from '../../utils/storage';
import { buildMissingDataPrompt, parseMissingDataResponse } from '../../utils/searchQuery';

// Batch size for the "Copy AI Prompt" action — capped so a single prompt
// stays a manageable size for an AI to answer accurately in one go.
const MISSING_DATA_PROMPT_BATCH_SIZE = 10;

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
  onUpdateEntry,
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
  const [promptCopied, setPromptCopied] = useState(false);
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

  const isMissingData = (entry) => !entry.originalYear || !entry.originalGenre;
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

  // Project-wide (ignores the search box) and capped, so the AI prompt
  // stays a manageable batch size instead of dumping every missing song at
  // once — filling in one batch naturally surfaces the next on re-click.
  const missingEntries = useMemo(
    () => [...savedEntries].filter(isMissingData).sort(compareEntries),
    [savedEntries, compareEntries],
  );
  const missingBatch = missingEntries.slice(0, MISSING_DATA_PROMPT_BATCH_SIZE);

  const handleCopyMissingDataPrompt = () => {
    navigator.clipboard.writeText(buildMissingDataPrompt(missingBatch));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 500);
  };

  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [applyResult, setApplyResult] = useState(null);

  // Applies a pasted AI response (the format buildMissingDataPrompt asks
  // for) back onto matching saved entries. Non-destructive by design: only
  // fills a field that's currently empty, never overwrites data the user
  // already has, mirroring the same "don't clobber real data" policy the
  // Import merge fix established for this file's other data-loading paths.
  const handleApplyPastedResponse = () => {
    const { matches, unmatched } = parseMissingDataResponse(pasteText, savedEntries);

    let updatedCount = 0;
    let skippedCount = 0;

    matches.forEach(({ entry, originalYear, originalGenre }) => {
      const updates = {};
      if (!entry.originalYear && originalYear) updates.originalYear = originalYear;
      if (!entry.originalGenre && originalGenre) updates.originalGenre = originalGenre;

      if (Object.keys(updates).length > 0) {
        onUpdateEntry(entry.id, updates);
        updatedCount += 1;
      } else {
        skippedCount += 1;
      }
    });

    setApplyResult({ updatedCount, skippedCount, unmatched });
    setPasteText('');
  };
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

                {hasMissingData && (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={handleCopyMissingDataPrompt}
                  >
                    {promptCopied
                      ? 'Copied ✔️'
                      : `Copy AI Prompt (${missingBatch.length} of ${missingEntries.length} missing)`}
                  </button>
                )}

                {hasMissingData && (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setShowPasteBox((prev) => !prev);
                      setApplyResult(null);
                    }}
                  >
                    Paste AI Response
                  </button>
                )}
              </div>

              {showPasteBox && (
                <div className="saved-library-paste-box">
                  <textarea
                    className="form-input"
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste the AI's reply here, one line per song (Artist - Song: Year, Genre1, Genre2)..."
                  />
                  <div className="button-row">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={handleApplyPastedResponse}
                      disabled={!pasteText.trim()}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        setShowPasteBox(false);
                        setPasteText('');
                        setApplyResult(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  {applyResult && (
                    <p className="output-text">
                      Updated {applyResult.updatedCount} song
                      {applyResult.updatedCount === 1 ? '' : 's'}.
                      {applyResult.skippedCount > 0 &&
                        ` ${applyResult.skippedCount} already had data.`}
                      {applyResult.unmatched.length > 0 &&
                        ` Couldn't match ${applyResult.unmatched.length} line${applyResult.unmatched.length === 1 ? '' : 's'}: ${applyResult.unmatched.join(' | ')}`}
                    </p>
                  )}
                </div>
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
