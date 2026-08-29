import ToggleButton from '../ui/ToggleButton';
import TodoItem from './TodoItem';
import { buildTodoStatusPanelKey } from '../../utils/todoPanelKey';

export default function TodoStatusSection({
  status,
  entries = [],
  todoStatuses = [],
  panelVisibility,
  togglePanel,
  onLoadEntry,
  onUpdateEntryTodo,
  onUpdateEntry,
  todoTarget,
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
              onUpdateEntry={onUpdateEntry}
              highlighted={todoTarget?.entryId === entry.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
