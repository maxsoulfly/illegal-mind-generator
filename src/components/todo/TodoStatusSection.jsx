import ToggleButton from '../ui/ToggleButton';
import TodoItem from './TodoItem';

function buildTodoStatusPanelKey(status) {
  return `todoStatus_${status
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')}`;
}

export default function TodoStatusSection({
  status,
  entries = [],
  todoStatuses = [],
  panelVisibility,
  togglePanel,
  onLoadEntry,
  onUpdateEntryTodo,
}) {
  const panelKey = buildTodoStatusPanelKey(status);
  const isOpen = panelVisibility[panelKey] ?? entries.length > 0;

  return (
    <div className="terminal-block todo-status-section">
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
}
