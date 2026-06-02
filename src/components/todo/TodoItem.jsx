import { useState } from 'react';
import TodoStatusSelect from './TodoStatusSelect';

export default function TodoItem({
  entry,
  todoStatuses = [],
  onLoadEntry,
  onUpdateEntryTodo,
}) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <>
      <div className="saved-entry-row terminal-block">
        <div className="saved-entry-main">
          <span className="saved-entry-signal">
            {(entry.signalNumber || '--').toString().padStart(2, '0')}.
          </span>

          <button
            type="button"
            className="queue-entry-link saved-entry-text"
            onClick={() => onLoadEntry(entry)}
          >
            <strong>{entry.artist}</strong> — {entry.song}
          </button>

          <span className="saved-entry-tags">
            {entry.transformationTags?.length > 0 &&
              `[${entry.transformationTags.join(', ')}]`}
          </span>
        </div>

        <div className="saved-entry-actions todo-entry-actions">
          <TodoStatusSelect
            value={entry.todo?.status || ''}
            statuses={todoStatuses}
            onChange={(status) =>
              onUpdateEntryTodo(entry.id, {
                ...(entry.todo || {}),
                status,
              })
            }
          />

          <button
            type="button"
            className="button-secondary saved-entry-button"
            onClick={() => setShowNotes((prev) => !prev)}
          >
            {showNotes ? 'Hide Notes' : 'Notes'}
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="todo-notes-panel terminal-block">
          <textarea
            className="form-textarea"
            value={entry.todo?.notes || ''}
            rows={3}
            placeholder="Todo notes..."
            onChange={(e) =>
              onUpdateEntryTodo(entry.id, {
                ...(entry.todo || {}),
                notes: e.target.value,
              })
            }
          />
        </div>
      )}
    </>
  );
}
