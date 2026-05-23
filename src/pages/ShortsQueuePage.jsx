function ShortsQueuePage() {
  return (
    <section className="page-panel">
      <div className="section-header">
        <div>
          <h2>Shorts Queue</h2>
          <p>Randomized upcoming Shorts list for this project.</p>
        </div>

        <button type="button" disabled>
          Randomize
        </button>
      </div>

      <div className="empty-state">
        <p>No queue yet.</p>
        <p>Randomizer logic will be added in the next section.</p>
      </div>
    </section>
  );
}

export default ShortsQueuePage;
