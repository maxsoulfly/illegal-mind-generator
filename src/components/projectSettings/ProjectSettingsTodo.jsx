import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import TemplateGroupCard from '../ui/TemplateGroupCard';
import PhraseRow from '../ui/PhraseRow';
import AddBulkRow from '../ui/AddBulkRow';
import BulkTextarea from '../ui/BulkTextarea';

// Dnd-kit-aware shell around one status row — drag handle + PhraseRow (which
// already renders its own MoveControls as a precise/keyboard-friendly
// fallback, same coexistence SortableActiveBlock uses for Active Layout).
// `id` combines value+index so it stays unique even for two blank rows
// mid-add; that pairing only needs to hold for the duration of one drag
// gesture (state doesn't change until drop), so it's safe despite not being
// a stable per-item identity across renders.
function SortableStatusRow({ id, ...rowProps }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`desc-block-wrapper${isDragging ? ' dragging' : ''}`}>
      <span className="desc-drag-handle" data-tooltip="Drag to reorder" aria-label="Drag to reorder" {...attributes} {...listeners}>⠿</span>
      <PhraseRow {...rowProps} />
    </div>
  );
}

// todoStatuses is a flat top-level projects.json array, so the existing
// top-level spread in buildResolvedProjectConfig.js's mergeProjectOverrides()
// already merges an override correctly — no dedicated merge block needed.
// Renaming/removing a status has no migration for saved entries already
// using the old string — they become invisible (filtered out of every
// section on the Todo page) rather than deleted. See Known Gotchas.
//
// Order matters here (TodoPage.jsx builds its sections by mapping over this
// array in order), unlike every other array HookTemplateEditor normally
// edits — those are random-pick phrase pools where order is meaningless.
// So this renders its own PhraseRow list (drag-and-drop + move buttons, no
// search box) instead of using TemplateGroupCard's built-in
// templates/onUpdateTemplates.
export default function ProjectSettingsTodo({
  projectConfig,
  updateProjectOverride,
  resetProjectOverride,
}) {
  const statuses = projectConfig.todoStatuses || [];
  const [bulkValue, setBulkValue] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const rowIds = statuses.map((status, index) => `${status}::${index}`);

  function setStatuses(next) {
    updateProjectOverride({ todoStatuses: next });
  }

  function handleMove(index, direction) {
    const next = [...statuses];
    next.splice(index, 1);
    next.splice(index + direction, 0, statuses[index]);
    setStatuses(next);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rowIds.indexOf(active.id);
    const newIndex = rowIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setStatuses(arrayMove(statuses, oldIndex, newIndex));
  }

  function handleCommit(index, value) {
    const next = [...statuses];
    next[index] = value;
    setStatuses(next);
  }

  function handleRemove(index) {
    setStatuses(statuses.filter((_, i) => i !== index));
  }

  function handleAdd() {
    setStatuses([...statuses, '']);
  }

  function applyBulk() {
    const newLines = (bulkValue || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!newLines.length) return;

    setStatuses([...statuses, ...newLines]);
    setBulkValue(null);
  }

  return (
    <section>
      <h2 className="panel-title">Todo Settings</h2>

      <div className="tag-library tag-library--3col">
        <TemplateGroupCard
          label="Statuses"
          subtitle="Cover planning workflow stages, shown as sections on the Todo page in this order. The first status is used for Bulk Add."
          onReset={() => resetProjectOverride('todoStatuses')}
        >
          <span className="tag-status">{statuses.length} statuses</span>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
              {statuses.map((status, index) => (
                <SortableStatusRow
                  key={rowIds[index]}
                  id={rowIds[index]}
                  value={status}
                  placeholders={[]}
                  onCommit={(value) => handleCommit(index, value)}
                  onRemove={() => handleRemove(index)}
                  onMoveUp={() => handleMove(index, -1)}
                  onMoveDown={() => handleMove(index, 1)}
                  disabledMoveUp={index === 0}
                  disabledMoveDown={index === statuses.length - 1}
                />
              ))}
            </SortableContext>
          </DndContext>

          {bulkValue != null && (
            <BulkTextarea
              value={bulkValue}
              onChange={setBulkValue}
              onApply={applyBulk}
              onCancel={() => setBulkValue(null)}
              placeholders={[]}
            />
          )}

          <AddBulkRow onAdd={handleAdd} onBulk={() => setBulkValue('')} />
        </TemplateGroupCard>
      </div>
    </section>
  );
}
