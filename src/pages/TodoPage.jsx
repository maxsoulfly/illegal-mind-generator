import TodoBulkAdd from '../components/todo/TodoBulkAdd';
import TodoStatusSection from '../components/todo/TodoStatusSection';
export default function TodoPage({
  savedEntries = [],
  todoStatuses = [],
  onLoadEntry,
  onUpdateEntryTodo,
  projectConfig,
  onAddEntries,
  panelVisibility,
  togglePanel,
  onUpdateEntry,
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
      
      <TodoBulkAdd
        savedEntries={savedEntries}
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
        />
      ))}
    </section>
  );
}
