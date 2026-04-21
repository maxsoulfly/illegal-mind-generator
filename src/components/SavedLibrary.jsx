import { useState } from 'react';

function SavedLibrary({
  savedEntries,
  onLoadEntry,
  onDeleteEntry,
  onExportEntries,
  onImportEntries,
}) {
  const [search, setSearch] = useState('');

  const [showSavedLibrary, setShowSavedLibrary] = useState(false);

  const filteredEntries = savedEntries.filter((entry) => {
    const q = search.toLowerCase();

    return (
      entry.artist.toLowerCase().includes(q) ||
      entry.song.toLowerCase().includes(q)
    );
  });
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
                <div key={entry.id} className="output-item terminal-block">
                  <p>
                    <strong>{entry.artist}</strong> - {entry.song}
                  </p>
                  {entry.signalNumber && <p>Signal: {entry.signalNumber}</p>}
                  <div className="saved-entry-actions">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => onLoadEntry(entry)}
                    >
                      Load
                    </button>

                    <button
                      type="button"
                      className="button-secondary"
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
