function ShortsQueueItem({ entry, index, onLoadEntry, onUploaded }) {
  return (
    <div className="saved-entry-row terminal-block">
      <div className="saved-entry-main">
        <span className="saved-entry-signal">
          {(index + 1).toString().padStart(2, '0')}.
        </span>

        <button
          type="button"
          className="queue-entry-link saved-entry-text"
          onClick={() => onLoadEntry(entry)}
        >
          <strong>{entry.artist}</strong> — {entry.song}
        </button>

        {entry.transformationTags?.length > 0 && (
          <span className="saved-entry-tags">
            [{entry.transformationTags.slice(0, 2).join(', ')}]
          </span>
        )}
      </div>

      <div className="saved-entry-actions">
        <button
          type="button"
          className="button-secondary saved-entry-button"
          onClick={onUploaded}
        >
          X
        </button>
      </div>
    </div>
  );
}

export default ShortsQueueItem;
