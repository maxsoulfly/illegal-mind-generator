import { useEffect } from 'react';

import TodoBulkAdd from '../components/todo/TodoBulkAdd';
import TodoStatusSection from '../components/todo/TodoStatusSection';
import { buildTodoStatusPanelKey } from '../utils/todoPanelKey';

export default function TodoPage({
  savedEntries = [],
  todoStatuses = [],
  onLoadEntry,
  onUpdateEntryTodo,
  projectConfig,
  onAddEntries,
  panelVisibility,
  setPanelVisibility,
  togglePanel,
  onUpdateEntry,
  todoTarget,
}) {
  const todoEntries = savedEntries.filter((entry) => entry.todo?.status);

  // Force-open the targeted entry's status section — a manually-collapsed
  // section would otherwise hide the row the badge just navigated to.
  useEffect(() => {
    if (!todoTarget?.entryId) return;
    const targetEntry = savedEntries.find((entry) => entry.id === todoTarget.entryId);
    if (!targetEntry?.todo?.status) return;

    const panelKey = buildTodoStatusPanelKey(targetEntry.todo.status);
    setPanelVisibility((prev) => (prev[panelKey] ? prev : { ...prev, [panelKey]: true }));
  }, [todoTarget, savedEntries, setPanelVisibility]);

  const entriesByStatus = todoStatuses.map((status) => ({
    status,
    entries: todoEntries.filter((entry) => entry.todo?.status === status),
  }));

  return (
    <section className="page-panel">
      <TodoBulkAdd
        savedEntries={savedEntries}
        todoStatuses={todoStatuses}
        onAddEntries={onAddEntries}
        isOpen={panelVisibility.todoBulkAdd}
        onToggle={() => togglePanel('todoBulkAdd')}
      />

      {entriesByStatus.map(({ status, entries }) => (
        <TodoStatusSection
          key={status}
          status={status}
          entries={entries}
          todoStatuses={todoStatuses}
          panelVisibility={panelVisibility}
          togglePanel={togglePanel}
          onLoadEntry={onLoadEntry}
          onUpdateEntryTodo={onUpdateEntryTodo}
          onUpdateEntry={onUpdateEntry}
          todoTarget={todoTarget}
        />
      ))}
    </section>
  );
}
