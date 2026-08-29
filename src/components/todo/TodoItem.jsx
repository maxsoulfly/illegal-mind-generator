import { useEffect, useState } from 'react';
import TodoStatusSelect from './TodoStatusSelect';
import QueueSettings from '../input/QueueSettings';
import ToggleButton from '../ui/ToggleButton';
import EntrySettings from '../entry/EntrySettings';
import SavedEntryRow from '../ui/SavedEntryRow';

export default function TodoItem({
  entry,
  todoStatuses = [],
  onLoadEntry,
  onUpdateEntryTodo,
  onUpdateEntry,
  highlighted = false,
}) {
  const [showNotes, setShowNotes] = useState(false);

  // Scroll to this row when it's the target of a Saved Library "jump to
  // Todo" click — same convention as SongBlockOverrideFields' scroll effect.
  useEffect(() => {
    if (!highlighted) return;
    document.getElementById(`todo-entry-${entry.id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [highlighted, entry.id]);

  return (
    <div id={`todo-entry-${entry.id}`} className={highlighted ? 'tag-section--highlight' : undefined}>
      <SavedEntryRow
        signal={(entry.signalNumber || '00').toString().padStart(2, '0')}
        artist={entry.artist}
        song={entry.song}
        onTitleClick={() => onLoadEntry(entry)}
        tags={entry.transformationTags}
        middle={
          entry.todo?.notes && (
            <div
              className="todo-note-preview"
              data-tooltip={entry.todo.notes}
              onClick={() => setShowNotes((prev) => !prev)}
            >
              📝 {entry.todo.notes.slice(0, 40)}
              {entry.todo.notes.length > 40 ? '…' : ''}
            </div>
          )
        }
        actionsClassName="todo-entry-actions"
        actions={
          <>
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
          </>
        }
      />
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
    </div>
  );
}
