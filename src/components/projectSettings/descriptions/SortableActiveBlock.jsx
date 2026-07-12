import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import BlockInfoCard from '../../ui/BlockInfoCard';
import MoveControls from '../../ui/MoveControls';

// Dnd-kit-aware shell around a single Active Layout row, shared by
// LongDescriptionSettings.jsx / ShortsDescriptionSettings.jsx so the two
// don't drift (CLAUDE.md flags them as needing to stay in sync). Drag
// listeners attach only to the grip handle, not the whole row, so dragging
// can't hijack clicks on MoveControls or BlockInfoCard's own buttons.
export default function SortableActiveBlock({
  id,
  label,
  onRemove,
  onNavigate,
  disabledUp,
  disabledDown,
  onMoveUp,
  onMoveDown,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`desc-block-wrapper${isDragging ? ' dragging' : ''}`}
    >
      <span
        className="desc-drag-handle"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⠿
      </span>

      <MoveControls
        className="desc-block-move-controls"
        disabledUp={disabledUp}
        disabledDown={disabledDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />

      <BlockInfoCard label={label} onRemove={onRemove} onNavigate={onNavigate} />
    </div>
  );
}
