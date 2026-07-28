import { PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// Shared Active Layout reorder logic for LongDescriptionSettings.jsx and
// ShortsDescriptionSettings.jsx — identical between the two pages, differing
// only in what updateLayout actually persists (templates.long.layout vs
// templates.shorts.layout, each page's own concern). See
// DescriptionLayoutBoard.jsx for the paired shared JSX.
export default function useDescriptionLayoutActions({ activeKeys, defaultLayout, updateLayout }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Infinity so dynamic/user-created blocks (not in defaultLayout) sort to the end on Reset Order.
  function layoutIndex(key) {
    const idx = defaultLayout.indexOf(key);
    return idx === -1 ? Infinity : idx;
  }

  function addToLayout(key) {
    if (!defaultLayout.includes(key)) {
      updateLayout([...activeKeys, key]);
      return;
    }
    const targetIndex = defaultLayout.indexOf(key);
    const next = [...activeKeys];
    // Insert after the last active block whose defaultLayout position is before this one,
    // so re-adding a block preserves the original ordering rather than always appending.
    const insertAt = next.findLastIndex((k) => layoutIndex(k) < targetIndex) + 1;
    next.splice(insertAt, 0, key);
    updateLayout(next);
  }

  function removeFromLayout(key) {
    updateLayout(activeKeys.filter((k) => k !== key));
  }

  function moveBlock(key, direction) {
    const idx = activeKeys.indexOf(key);
    const next = [...activeKeys];
    next.splice(idx, 1);
    next.splice(idx + direction, 0, key);
    updateLayout(next);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    updateLayout(
      arrayMove(activeKeys, activeKeys.indexOf(active.id), activeKeys.indexOf(over.id)),
    );
  }

  function resetOrder() {
    const sorted = [...activeKeys].sort((a, b) => layoutIndex(a) - layoutIndex(b));
    updateLayout(sorted);
  }

  return { sensors, layoutIndex, addToLayout, removeFromLayout, moveBlock, handleDragEnd, resetOrder };
}
