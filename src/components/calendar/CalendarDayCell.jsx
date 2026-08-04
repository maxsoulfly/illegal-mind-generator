import SavedEntryRow from '../ui/SavedEntryRow';
import { isToday } from '../../utils/calendarDates';

const STATUS_LABELS = {
  planned: 'Planned',
  missed: 'Missed',
  uploaded: 'Uploaded',
  'uploaded-drift': 'Uploaded (differs)',
};

const STATUS_MODIFIER_CLASS = {
  planned: 'calendar-slot-row--planned',
  missed: 'calendar-slot-row--missed',
  uploaded: 'calendar-slot-row--uploaded',
  'uploaded-drift': 'calendar-slot-row--drift',
};

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status];
  if (!label) return null;
  return <span className={`calendar-status-badge ${STATUS_MODIFIER_CLASS[status]}`}>[{label}]</span>;
}

export default function CalendarDayCell({ day, onLoadEntry }) {
  const { isoDate, inCurrentMonth, calendarSlots } = day;
  const dayNumber = Number(isoDate.slice(-2));
  const today = isToday(isoDate);

  return (
    <div
      className={`calendar-day-cell${inCurrentMonth ? '' : ' calendar-day-cell--other-month'}${today ? ' calendar-day-cell--today' : ''}`}
    >
      <div className="calendar-day-number">{dayNumber}</div>

      <div className="calendar-day-slots">
        {calendarSlots.map((slot) => {
          if (slot.status === 'empty') {
            return (
              <div key={slot.slotKey} className="calendar-slot-placeholder">
                {slot.videoType.toUpperCase()}
              </div>
            );
          }

          if (slot.status === 'uploaded-drift') {
            return (
              <div key={slot.slotKey} className="calendar-slot-group">
                <SavedEntryRow
                  signal={slot.videoType.toUpperCase()}
                  artist={slot.plannedEntry?.artist}
                  song={slot.plannedEntry?.song}
                  onTitleClick={() => slot.plannedEntry && onLoadEntry(slot.plannedEntry)}
                  badges={<span className="calendar-status-badge calendar-slot-row--planned">[Planned]</span>}
                />
                <SavedEntryRow
                  signal={slot.videoType.toUpperCase()}
                  artist={slot.uploadedEntry?.artist}
                  song={slot.uploadedEntry?.song}
                  onTitleClick={() => slot.uploadedEntry && onLoadEntry(slot.uploadedEntry)}
                  badges={<StatusBadge status={slot.status} />}
                />
              </div>
            );
          }

          const entry = slot.status === 'uploaded' ? slot.uploadedEntry : slot.plannedEntry;

          return (
            <SavedEntryRow
              key={slot.slotKey}
              signal={slot.videoType.toUpperCase()}
              artist={entry?.artist}
              song={entry?.song}
              onTitleClick={() => entry && onLoadEntry(entry)}
              badges={<StatusBadge status={slot.status} />}
            />
          );
        })}
      </div>
    </div>
  );
}
