import { useDroppable } from '@dnd-kit/core';

// One drop target per slot row (both empty placeholders and already-occupied
// rows) — `data.occupied` (already has a plannedEntryId) disables it so a
// drag can't silently clobber another planned song; dropping a plan onto an
// upload-only slot (no plannedEntryId yet) is still allowed, matching what
// the existing Ctrl+Click "Change Plan" flow already permits there.
export default function CalendarSlotDropZone({ isoDate, videoType, occupied, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${isoDate}|${videoType}`,
    data: { isoDate, videoType, occupied },
    disabled: occupied,
  });

  return (
    <div
      ref={setNodeRef}
      className={`calendar-slot-dropzone${isOver && !occupied ? ' calendar-slot-dropzone--over' : ''}`}
    >
      {children}
    </div>
  );
}
