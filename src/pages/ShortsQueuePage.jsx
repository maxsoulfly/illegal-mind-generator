import { useShortsQueue } from '../hooks/useShortsQueue';

import ShortsQueueItem from '../components/shortsQueue/ShortsQueueItem';
import ShortsQueueEmptyState from '../components/shortsQueue/ShortsQueueEmptyState';

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

  const hasSavedEntries = savedEntries.length > 0;
  const hasQueue = queue.length > 0;

  return (
    <section className="page-panel">
      <div className="panel-header">
        <h1 className="app-title">Shorts Queue — {projectConfig.name}</h1>
        <div className="regenerate-row">
          <button
            type="button"
            className="button-primary"
            onClick={randomizeQueue}
            disabled={!hasSavedEntries}
          >
            Randomize
          </button>
        </div>
      </div>

      {!hasSavedEntries && (
        <ShortsQueueEmptyState
          title="No saved entries yet."
          message="Save covers first, then generate a Shorts queue."
        />
      )}

      {hasSavedEntries && !hasQueue && (
        <ShortsQueueEmptyState
          title="No queue yet."
          message="Click Randomize to create a 20-cover Shorts queue."
        />
      )}

      {hasQueue && (
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
