import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// A selected transformation-tag chip, reorderable by dragging the whole chip.
// Drag activation has an 8px pointer threshold (see TransformationTagSelector's
// sensors), so a press that doesn't move far enough is still a plain click:
//   - click            -> onTagToggle(tag)  (deselect)
//   - Ctrl/Cmd + click  -> onOpenSourceTag(tag)  (open in Tag Library)
// dnd-kit suppresses the trailing click when a real drag happened, so a
// drop never also toggles the tag off.
export default function SortableTagChip({
  tag,
  tagData,
  tagUsage,
  onTagToggle,
  onOpenSourceTag,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag });

  const label = tagData?.label || tag;
  const tooltip = tagData?.category
    ? `${tagData.category} — drag to reorder priority · Ctrl+Click to open in Tag Library`
    : 'Drag to reorder priority · Ctrl+Click to open in Tag Library';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`tag-chip active tag-chip--sortable${isDragging ? ' dragging' : ''}`}
      style={style}
      data-tooltip={tooltip}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if ((e.ctrlKey || e.metaKey) && onOpenSourceTag) {
          onOpenSourceTag(tag);
          return;
        }

        onTagToggle(tag);
      }}
    >
      {label} ({tagUsage[tag] || 0})
    </button>
  );
}
