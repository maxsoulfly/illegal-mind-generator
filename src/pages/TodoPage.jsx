import TodoItem from '../components/todo/TodoItem';
import BulkSongEntry from '../components/shared/BulkSongEntry';
import ToggleButton from '../components/ui/ToggleButton';

export default function TodoPage({
  savedEntries = [],
  todoStatuses = [],
  onLoadEntry,
  onUpdateEntryTodo,
  projectConfig,
  onAddEntries,
  panelVisibility,
  togglePanel,
}) {
  const todoEntries = savedEntries.filter((entry) => entry.todo?.status);

  const entriesByStatus = todoStatuses.map((status) => ({
    status,
    entries: todoEntries.filter((entry) => entry.todo?.status === status),
  }));
  function handleBulkAddWishlistSongs(songs) {
    const newEntries = songs
      .filter(({ artist, song }) => {
        return !savedEntries.some(
          (entry) =>
            entry.artist?.toLowerCase() === artist.toLowerCase() &&
            entry.song?.toLowerCase() === song.toLowerCase(),
        );
      })
      .map(({ artist, song }) => ({
        id: crypto.randomUUID(),
        artist,
        song,
        signalNumber: '',
        videoType: 'short',
        transformationTags: [],
        excludeFromRandomizer: false,
        todo: {
          status: 'Wishlist',
          notes: '',
        },
      }));

    if (newEntries.length === 0) return;

    onAddEntries(newEntries);
  }

  return (
    <section className="page-panel">
      <div className="panel-header">
        <h1 className="app-title">Todo — {projectConfig.name}</h1>
      </div>
      <BulkSongEntry
        title="Bulk Add Wishlist Covers"
        buttonLabel="Add to Wishlist"
        placeholder={`Thrice – The Artist in the Ambulance
The Offspring – Gotta Get Away
Papa Roach – Blood Brothers`}
        isOpen={panelVisibility.todoBulkAdd}
        onToggle={() => togglePanel('todoBulkAdd')}
        onAddSongs={handleBulkAddWishlistSongs}
      />
      {!todoEntries.length && (
        <div className="empty-state">
          <p>No todo items yet.</p>
          <p>Mark saved covers with a todo status to show them here.</p>
        </div>
      )}

      {!!todoEntries.length && (
        <div className="saved-library-list shorts-queue-list">
          {entriesByStatus.map(({ status, entries }) => {
            const panelKey = `todoStatus_${status
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^a-z0-9_]/g, '')}`;

            const isOpen = panelVisibility[panelKey] ?? entries.length > 0;

            return (
              <div className="terminal-block todo-status-section" key={status}>
                <div className="panel-header">
                  <h2 className="panel-title">
                    {status} ({entries.length})
                  </h2>

                  <ToggleButton
                    isOpen={isOpen}
                    onClick={() => togglePanel(panelKey)}
                    compact
                  />
                </div>

                {isOpen && (
                  <div className="todo-status-items">
                    {entries.length === 0 && (
                      <p className="empty-state">No items in this status.</p>
                    )}

                    {entries.map((entry) => (
                      <TodoItem
                        key={entry.id}
                        entry={entry}
                        todoStatuses={todoStatuses}
                        onLoadEntry={onLoadEntry}
                        onUpdateEntryTodo={onUpdateEntryTodo}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
