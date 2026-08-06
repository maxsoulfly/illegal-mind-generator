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
    if (!from || !to || to.occupied) return;
    if (from.videoType !== to.videoType) return;
    if (from.isoDate === to.isoDate) return;

    calendar.setPlannedEntry(to.isoDate, to.videoType, from.entryId);
    calendar.clearPlannedEntry(from.isoDate, from.videoType);
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
