import TodoItem from '../components/todo/TodoItem';

export default function TodoPage({
  savedEntries = [],
  todoStatuses = [],
  onLoadEntry,
  onUpdateEntryTodo,
  projectConfig,
}) {
  const todoEntries = savedEntries.filter((entry) => entry.todo?.status);

  const entriesByStatus = todoStatuses.map((status) => ({
    status,
    entries: todoEntries.filter((entry) => entry.todo?.status === status),
  }));

  return (
    <section className="page-panel">
      <div className="panel-header">
        <h1 className="app-title">Todo — {projectConfig.name}</h1>
      </div>

      {!todoEntries.length && (
        <div className="empty-state">
          <p>No todo items yet.</p>
          <p>Mark saved covers with a todo status to show them here.</p>
        </div>
      )}

      {!!todoEntries.length && (
        <div className="saved-library-list shorts-queue-list">
          {entriesByStatus.map(({ status, entries }) => (
            <details
              className="tag-section"
              key={status}
              open={entries.length > 0}
            >
              <summary>
                {status} ({entries.length})
              </summary>

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
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
