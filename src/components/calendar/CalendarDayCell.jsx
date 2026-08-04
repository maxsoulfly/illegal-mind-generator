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
// is used (Saved Library/Shorts Queue/Todo are full-width lists), so this
// is a compact card instead. No visible action buttons at all — following
// this app's existing Ctrl+Click convention (Transformation Tags → Tag
// Library), plain vs. modifier click on the title/status does the work:
//   - title click: load into Generator · Ctrl+Click: change the plan
//   - status click: confirm/toggle upload directly · Ctrl+Click: pick a
//     specific different upload (the drift case)
function CalendarSlotEntry({
  videoType,
  status,
  entry,
  onLoadEntry,
  onEditPlan,
  onEditUpload,
  onQuickToggle,
}) {
  function handleTitleClick(e) {
    if (e.ctrlKey || e.metaKey) {
      onEditPlan();
      return;
    }
    if (entry) onLoadEntry(entry);
  }

  function handleStatusClick(e) {
    if (e.ctrlKey || e.metaKey) {
      onEditUpload();
      return;
    }
    onQuickToggle();
  }

  const statusTitle =
    status === 'uploaded' || status === 'uploaded-drift'
      ? 'Click to clear this upload · Ctrl+Click to set a different one'
      : 'Click to confirm as uploaded · Ctrl+Click to set a different upload';

  return (
    <div className={`calendar-slot-entry ${STATUS_MODIFIER_CLASS[status]}`}>
      <button
        type="button"
        className="calendar-slot-entry-title"
        onClick={handleTitleClick}
        title={entry ? `${entry.artist} — ${entry.song} · Ctrl+Click to change plan` : ''}
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

      <button
        type="button"
        className="calendar-slot-entry-status"
        onClick={handleStatusClick}
        title={statusTitle}
      >
        {VIDEO_TYPE_ABBR[videoType] || videoType.toUpperCase()} · {STATUS_LABELS[status]}
      </button>
    </div>
  );
}

export default function CalendarDayCell({ day, onLoadEntry, onSlotClick, calendar }) {
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
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    onSlotClick(isoDate, slot.videoType, 'upload');
                  } else {
                    onSlotClick(isoDate, slot.videoType, 'plan');
                  }
                }}
                title={`Click to plan a ${slot.videoType} · Ctrl+Click to log an upload`}
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
                  onEditPlan={() => onSlotClick(isoDate, slot.videoType, 'plan')}
                  onEditUpload={() => onSlotClick(isoDate, slot.videoType, 'upload')}
                  onQuickToggle={() => calendar.confirmUploadedAsPlanned(isoDate, slot.videoType)}
                />
                <CalendarSlotEntry
                  videoType={slot.videoType}
                  status="uploaded-drift"
                  entry={slot.uploadedEntry}
                  onLoadEntry={onLoadEntry}
                  onEditPlan={() => onSlotClick(isoDate, slot.videoType, 'plan')}
                  onEditUpload={() => onSlotClick(isoDate, slot.videoType, 'upload')}
                  onQuickToggle={() => calendar.clearUploadedEntry(isoDate, slot.videoType)}
                />
              </div>
            );
          }

          const entry = slot.status === 'uploaded' ? slot.uploadedEntry : slot.plannedEntry;
          const quickToggle =
            slot.status === 'uploaded'
              ? () => calendar.clearUploadedEntry(isoDate, slot.videoType)
              : () => calendar.confirmUploadedAsPlanned(isoDate, slot.videoType);

          return (
            <CalendarSlotEntry
              key={slot.slotKey}
              videoType={slot.videoType}
              status={slot.status}
              entry={entry}
              onLoadEntry={onLoadEntry}
              onEditPlan={() => onSlotClick(isoDate, slot.videoType, 'plan')}
              onEditUpload={() => onSlotClick(isoDate, slot.videoType, 'upload')}
              onQuickToggle={quickToggle}
            />
          );
        })}
      </div>
    </div>
  );
}
