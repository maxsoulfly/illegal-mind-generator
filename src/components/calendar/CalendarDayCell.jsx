import IconButton from '../ui/IconButton';
import { isToday } from '../../utils/calendarDates';

const STATUS_LABELS = {
  planned: 'Planned',
  missed: 'Missed',
  uploaded: 'Uploaded',
  'uploaded-drift': 'Differs',
};

const VIDEO_TYPE_ABBR = {
  short: 'S',
  long: 'L',
};

const STATUS_MODIFIER_CLASS = {
  planned: 'calendar-slot-row--planned',
  missed: 'calendar-slot-row--missed',
  uploaded: 'calendar-slot-row--uploaded',
  'uploaded-drift': 'calendar-slot-row--drift',
};

// A calendar day cell is far narrower than every other place SavedEntryRow
// is used (Saved Library/Shorts Queue/Todo are full-width lists) — its
// horizontal signal+title+badge+action layout doesn't fit ~150-190px, so
// this uses a compact 2-line card instead: title on its own row (full width
// to truncate against), type/status/edit on a second row.
function CalendarSlotEntry({ videoType, status, entry, onLoadEntry, onEdit }) {
  return (
    <div className={`calendar-slot-entry ${STATUS_MODIFIER_CLASS[status]}`}>
      <button
        type="button"
        className="calendar-slot-entry-title"
        onClick={() => entry && onLoadEntry(entry)}
        title={entry ? `${entry.artist} — ${entry.song}` : ''}
      >
        {entry ? (
          <>
            <span className="calendar-slot-entry-artist">{entry.artist}</span>
            <span className="calendar-slot-entry-song">{entry.song}</span>
          </>
        ) : (
          '—'
        )}
      </button>
      <div className="calendar-slot-entry-meta" title={`${videoType} — ${STATUS_LABELS[status]}`}>
        <span className="calendar-slot-entry-status">
          {VIDEO_TYPE_ABBR[videoType] || videoType.toUpperCase()} · {STATUS_LABELS[status]}
        </span>
        {onEdit && (
          <IconButton icon="✎" title="Change planned song" onClick={onEdit} stopPropagation />
        )}
      </div>
    </div>
  );
}

export default function CalendarDayCell({ day, onLoadEntry, onSlotClick }) {
  const { isoDate, inCurrentMonth, calendarSlots } = day;
  const dayNumber = Number(isoDate.slice(-2));
  const today = isToday(isoDate);

  return (
    <div
      className={`calendar-day-cell${inCurrentMonth ? '' : ' calendar-day-cell--other-month'}${today ? ' calendar-day-cell--today' : ''}`}
      data-iso-date={isoDate}
    >
      <div className="calendar-day-number">{dayNumber}</div>

      <div className="calendar-day-slots">
        {calendarSlots.map((slot) => {
          if (slot.status === 'empty') {
            return (
              <button
                key={slot.slotKey}
                type="button"
                className="calendar-slot-placeholder"
                data-video-type={slot.videoType}
                onClick={() => onSlotClick(isoDate, slot.videoType)}
                title={`Plan a ${slot.videoType} for this day`}
              >
                {slot.videoType.toUpperCase()}
              </button>
            );
          }

          if (slot.status === 'uploaded-drift') {
            return (
              <div key={slot.slotKey} className="calendar-slot-group">
                <CalendarSlotEntry
                  videoType={slot.videoType}
                  status="planned"
                  entry={slot.plannedEntry}
                  onLoadEntry={onLoadEntry}
                />
                <CalendarSlotEntry
                  videoType={slot.videoType}
                  status="uploaded-drift"
                  entry={slot.uploadedEntry}
                  onLoadEntry={onLoadEntry}
                />
              </div>
            );
          }

          const entry = slot.status === 'uploaded' ? slot.uploadedEntry : slot.plannedEntry;
          const isEditable = slot.status === 'planned' || slot.status === 'missed';

          return (
            <CalendarSlotEntry
              key={slot.slotKey}
              videoType={slot.videoType}
              status={slot.status}
              entry={entry}
              onLoadEntry={onLoadEntry}
              onEdit={isEditable ? () => onSlotClick(isoDate, slot.videoType) : null}
            />
          );
        })}
      </div>
    </div>
  );
}
