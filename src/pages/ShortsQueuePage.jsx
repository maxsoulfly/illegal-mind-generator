import { useShortsQueue } from '../hooks/useShortsQueue';

function ShortsQueuePage({ projectId, savedEntries }) {
  const { queue, randomizeQueue } = useShortsQueue(projectId, savedEntries);

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
        <ol className="shorts-queue-list">
          {queue.map((entry, index) => (
            <li key={`${entry.artist}-${entry.song}-${index}`}>
              <strong>
                {entry.artist} - {entry.song}
              </strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default ShortsQueuePage;
