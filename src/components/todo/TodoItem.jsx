import { useState } from 'react';
import TodoStatusSelect from './TodoStatusSelect';
import QueueSettings from '../input/QueueSettings';
import ToggleButton from '../ui/ToggleButton';
import EntrySettings from '../entry/EntrySettings';

export default function TodoItem({
  entry,
  todoStatuses = [],
  onLoadEntry,
  onUpdateEntryTodo,
  onUpdateEntry,
}) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <>
      <div className="saved-entry-row terminal-block">
        <div className="saved-entry-main">
          <span className="saved-entry-signal">
            {(entry.signalNumber || '00').toString().padStart(2, '0')}.
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

        {entry.todo?.notes && (
          <div
            className="todo-note-preview"
            title={entry.todo.notes}
            onClick={() => setShowNotes((prev) => !prev)}
          >
            📝 {entry.todo.notes.slice(0, 40)}
            {entry.todo.notes.length > 40 ? '…' : ''}
          </div>
        )}

        <div className="saved-entry-actions todo-entry-actions ">
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

          <ToggleButton
            isOpen={showNotes}
            onClick={() => setShowNotes((prev) => !prev)}
            label="Notes"
            compact
          />
        </div>
      </div>
      {showNotes && (
        <div className="todo-notes-panel terminal-block">
          <EntrySettings entry={entry} onUpdateEntry={onUpdateEntry} />

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
