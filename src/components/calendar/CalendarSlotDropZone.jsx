import { useDroppable, useDndContext } from '@dnd-kit/core';

// One drop target per slot row (both empty placeholders and already-occupied
// rows). A slot can independently hold a plannedEntryId and an
// uploadedEntryId, and a drag normally moves only one of those fields (see
// CalendarMonthGrid's handleDragEnd) — so whether this zone is a valid
// target depends on which kind is currently being dragged, not on the slot
// alone. `useDndContext()` reads the active drag's `kind` ('planned' or
// 'uploaded', set by CalendarSlotEntry) to pick the right occupied flag:
// dropping a planned drag onto a slot that already has a plan is blocked,
// but dropping it onto an upload-only slot (no plan yet) is still allowed —
// same for the reverse — matching what the existing Ctrl+Click "Change
// Plan"/"Set Upload" flows already permit. A "mirrored" uploaded drag (its
// plannedEntryId equals its uploadedEntryId — the normal "confirmed from a
// plan" shape) moves both fields together, so it also needs the target's
// plannedOccupied clear, or it would silently overwrite an unrelated plan
// already sitting there.
export default function CalendarSlotDropZone({ isoDate, videoType, plannedOccupied, uploadedOccupied, children }) {
  const { active } = useDndContext();
  const activeData = active?.data?.current;
  const disabled =
    activeData?.kind === 'uploaded'
      ? uploadedOccupied || (activeData.mirrorsPlan && plannedOccupied)
      : plannedOccupied;

  const { setNodeRef, isOver } = useDroppable({
    id: `${isoDate}|${videoType}`,
    data: { isoDate, videoType, plannedOccupied, uploadedOccupied },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`calendar-slot-dropzone${isOver && !disabled ? ' calendar-slot-dropzone--over' : ''}`}
    >
      {children}
    </div>
  );
}
