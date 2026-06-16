import { useState } from 'react';
import IconButton from '../ui/IconButton';

function SavedLibraryItem({ entry, onLoadEntry, onDeleteEntry }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = () => {
    setIsLoading(true);

    window.setTimeout(() => {
      onLoadEntry(entry);
    }, 200);
  };
  return (
    <div
      className={`saved-entry-row terminal-block ${
        isLoading ? 'saved-entry-loading' : ''
      }`}
    >
      <div className="saved-entry-main">
        <span className="saved-entry-signal">
          {(entry.signalNumber || '--').toString().padStart(2, '0')}.
        </span>

        <button
          type="button"
          className="queue-entry-link saved-entry-text"
          onClick={handleLoad}
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
        <IconButton
          icon="×"
          className="button-secondary"
          onClick={() => onDeleteEntry(entry.id)}
        />
      </div>
    </div>
  );
}

export default SavedLibraryItem;
