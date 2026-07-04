import { useState } from 'react';

import FormField from '../ui/FormField';
import ToggleButton from '../ui/ToggleButton';
import TodoStatusSelect from './TodoStatusSelect';

export default function TodoFields({ todo = {}, statuses = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const status = todo.status || '';
  const notes = todo.notes || '';

  const updateTodo = (updates) => {
    onChange({
      status,
      notes,
      ...updates,
    });
  };

  return (
    <div className="form-group">
      <ToggleButton
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        label={`Todo: ${status || 'None'}`}
      />

      {isOpen && (
        <div className="advanced-panel-content">
          <FormField label="Todo Status">
            <TodoStatusSelect
              value={status}
              statuses={statuses}
              onChange={(nextStatus) =>
                updateTodo({
                  status: nextStatus,
                })
              }
            />
          </FormField>

          <FormField label="Todo Notes">
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) =>
                updateTodo({
                  notes: e.target.value,
                })
              }
              rows={3}
              placeholder="Remaster reason, rerecord note, video issue..."
            />
          </FormField>
        </div>
      )}
    </div>
  );
}
