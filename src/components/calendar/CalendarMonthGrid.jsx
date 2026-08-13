import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import CalendarDayCell from './CalendarDayCell';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Cross-cell drag between arbitrary day slots, not a sortable list — plain
// PointerSensor only (no KeyboardSensor/sortableKeyboardCoordinates, which
// assumes a linear reorderable list). The existing Ctrl+Click "Change Plan"
// flow remains the keyboard-accessible way to move a planned song.
export default function CalendarMonthGrid({ days, onLoadEntry, onSlotClick, calendar }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const from = active.data.current;
    const to = over.data.current;
    if (!from || !to) return;
    if (from.videoType !== to.videoType) return;
    if (from.isoDate === to.isoDate) return;

    if (from.kind === 'uploaded') {
      if (to.uploadedOccupied) return;
      // mirrorsPlan means the origin's plannedEntryId equals its
      // uploadedEntryId (the normal "confirmed from a plan" shape) — that
      // plannedEntryId isn't an unrelated fact left over from an old guess,
      // it's the same virtual entry, so it has to move too or it's left
      // behind as a ghost "planned" row at the origin, and the moved copy
      // (now upload-only) loses its ability to revert to "planned" via the
      // status quick-toggle. Also gate the target's plannedOccupied in this
      // case specifically, so a mirrored move can't silently clobber a
      // different, unrelated plan already sitting at the target.
      if (from.mirrorsPlan && to.plannedOccupied) return;

      calendar.setUploadedEntry(to.isoDate, to.videoType, from.entryId);
      calendar.clearUploadedEntry(from.isoDate, from.videoType);
      if (from.mirrorsPlan) {
        calendar.setPlannedEntry(to.isoDate, to.videoType, from.entryId);
        calendar.clearPlannedEntry(from.isoDate, from.videoType);
      }
    } else {
      if (to.plannedOccupied) return;
      calendar.setPlannedEntry(to.isoDate, to.videoType, from.entryId);
      calendar.clearPlannedEntry(from.isoDate, from.videoType);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="calendar-month-grid">
        {WEEKDAY_HEADERS.map((label) => (
          <div key={label} className="calendar-weekday-header">{label}</div>
        ))}

        {days.map((day) => (
          <CalendarDayCell
            key={day.isoDate}
            day={day}
            onLoadEntry={onLoadEntry}
            onSlotClick={onSlotClick}
            calendar={calendar}
          />
        ))}
      </div>
    </DndContext>
  );
}
