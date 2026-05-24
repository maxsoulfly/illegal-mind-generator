function SavedLibraryItem({ entry, onLoadEntry, onDeleteEntry }) {
  return (
    <div className="saved-entry-row terminal-block">
      <div className="saved-entry-main">
        <span className="saved-entry-signal">
          {(entry.signalNumber || '--').toString().padStart(2, '0')}.
        </span>

        <button
          type="button"
          className="queue-entry-link saved-entry-text"
          onClick={() => onLoadEntry(entry)}
        >
          <strong>{entry.artist}</strong> — {entry.song}
        </button>

        <span className="saved-entry-tags">
          {entry.transformationTags?.length > 0 &&
            `[${entry.transformationTags.join(', ')}]`}
        </span>

        <span className="saved-entry-hidden">
          {entry.excludeFromRandomizer && '[hidden]'}
        </span>
      </div>

      <div className="saved-entry-actions">
        <button
          type="button"
          className="button-secondary saved-entry-button"
          onClick={() => onDeleteEntry(entry.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default SavedLibraryItem;
