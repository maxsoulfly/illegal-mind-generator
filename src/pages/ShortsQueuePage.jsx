import { useShortsQueue } from '../hooks/useShortsQueue';

import ShortsQueueItem from '../components/ShortsQueueItem';

function ShortsQueuePage({
  projectId,
  savedEntries,
  onLoadEntry,
  projectConfig,
}) {
  const { queue, randomizeQueue, markUploaded } = useShortsQueue(
    projectId,
    savedEntries,
  );

  return (
    <section className="page-panel">
      <div className="panel-header">
        <h1 className="app-title">Shorts Queue — {projectConfig.name}</h1>
        <div className="regenerate-row">
          <button
            type="button"
            className="button-primary"
            onClick={randomizeQueue}
            disabled={!savedEntries.length}
          >
            Randomize
          </button>
        </div>
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
            <ShortsQueueItem
              key={`${entry.artist}-${entry.song}-${index}`}
              entry={entry}
              index={index}
              onLoadEntry={onLoadEntry}
              onUploaded={() => markUploaded(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ShortsQueuePage;
