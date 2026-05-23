import { useShortsQueue } from '../hooks/useShortsQueue';

function ShortsQueuePage({ projectId, savedEntries, onLoadEntry }) {
  const { queue, randomizeQueue, markUploaded } = useShortsQueue(
    projectId,
    savedEntries,
  );

  return (
    <section className="page-panel">
      <div className="section-header">
        <div>
          <h2>Shorts Queue</h2>
          <p>Randomized upcoming Shorts list for this project.</p>
        </div>

        <button
          type="button"
          onClick={randomizeQueue}
          disabled={!savedEntries.length}
        >
          Randomize
        </button>
      </div>

      {!savedEntries.length && (
        <div className="empty-state">
          <p>No saved entries yet.</p>
          <p>Save covers first, then generate a Shorts queue.</p>
        </div>
      )}

      {!!savedEntries.length && !queue.length && (
        <div className="empty-state">
          <p>No queue yet.</p>
          <p>Click Randomize to create a 20-cover Shorts queue.</p>
        </div>
      )}

      {!!queue.length && (
        <div className="saved-library-list shorts-queue-list">
          {queue.map((entry, index) => (
            <div
              key={`${entry.artist}-${entry.song}-${index}`}
              className="saved-entry-row terminal-block"
            >
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
                  onClick={() => markUploaded(index)}
                >
                  Uploaded
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ShortsQueuePage;
