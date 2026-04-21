import { useMemo, useState } from 'react';

function SavedLibrary({
  savedEntries,
  onLoadEntry,
  onDeleteEntry,
  onExportEntries,
  onImportEntries,
}) {
  const [search, setSearch] = useState('');
  const [showSavedLibrary, setShowSavedLibrary] = useState(false);

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
      .sort((a, b) => {
        const artistCompare = a.artist.localeCompare(b.artist);

        if (artistCompare !== 0) return artistCompare;

        return a.song.localeCompare(b.song);
      });
  }, [savedEntries, search]);

  return (
    <div>
      <button
        className="button-secondary"
        type="button"
        onClick={() => setShowSavedLibrary((prev) => !prev)}
      >
        {showSavedLibrary ? 'Hide Library' : 'Open Library'}
      </button>

      {showSavedLibrary && (
        <div className="saved-library-header">
          <div className="panel">
            <h3 className="panel-title">Saved Songs</h3>

            <input
              className="form-input"
              placeholder="Search saved songs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="saved-library-list">
              {filteredEntries.length === 0 && (
                <p className="output-text">No saved songs found.</p>
              )}

              {filteredEntries.map((entry) => (
                <div key={entry.id} className="saved-entry-row terminal-block">
                  <div className="saved-entry-main">
                    <span className="saved-entry-signal">
                      {(entry.signalNumber || '--').toString().padStart(2, '0')}
                      .
                    </span>

                    <span className="saved-entry-text">
                      <strong>{entry.artist}</strong> - {entry.song}
                    </span>
                  </div>

                  <div className="saved-entry-actions">
                    <button
                      type="button"
                      className="button-secondary saved-entry-button"
                      onClick={() => onLoadEntry(entry)}
                    >
                      Load
                    </button>

                    <button
                      type="button"
                      className="button-secondary saved-entry-button"
                      onClick={() => onDeleteEntry(entry.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
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
