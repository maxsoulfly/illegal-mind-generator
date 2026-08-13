import { useDraggable } from '@dnd-kit/core';

import { isToday, isBeforeToday } from '../../utils/calendarDates';
import IconButton from '../ui/IconButton';
import CalendarSlotDropZone from './CalendarSlotDropZone';

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

// An 'uploaded'/'uploaded-drift' slot dated after today means the upload was
// imported from a YouTube video that's still "Scheduled" rather than
// actually live — data-wise it's logged the same as a real upload (the user
// confirmed date/status distinction should only ever be visual, never a
// different write target), so this is purely a render-time flag, never
// stored, matching deriveSlotStatus's own "always derived" principle.
function isFutureUpload(isoDate, status) {
  return (status === 'uploaded' || status === 'uploaded-drift') && !isToday(isoDate) && !isBeforeToday(isoDate);
}

// A calendar day cell is far narrower than every other place SavedEntryRow
// is used (Saved Library/Shorts Queue/Todo are full-width lists), so this
// is a compact card instead. No visible action buttons at all — following
// this app's existing Ctrl+Click convention (Transformation Tags → Tag
// Library), plain vs. modifier click on the title/status does the work:
//   - title click: load into Generator · Ctrl+Click: change the plan
//   - status click: confirm/toggle upload directly · Ctrl+Click: pick a
//     specific different upload (the drift case)
// Clearing (×) stays restricted to a still-planned (unconfirmed) entry —
// clearing real upload history goes through the existing status-click
// quick-toggle instead, deliberately not a one-click ×. Dragging is wider:
// a planned/missed entry is always draggable, and so is an uploaded/
// uploaded-drift entry dated in the future (isFutureUpload) — those
// represent a YouTube video that's still "Scheduled," not live yet, so the
// user can still reschedule it here. A past/today upload is real, confirmed
// history and stays non-draggable. `kind` ('planned' vs 'uploaded') tags
// which field the drag moves, since a slot's plannedEntryId/uploadedEntryId
// are independent — CalendarMonthGrid's onDragEnd branches on it, and
// CalendarSlotDropZone reads it (via useDndContext) to decide whether the
// hovered target slot is already occupied for that specific kind. Dragging
// is a move, not a copy — the origin's field is cleared in the same
// onDragEnd that sets the target's. `mirrorsPlan` (only meaningful for
// kind 'uploaded') flags the normal "confirmed from a plan" shape, where
// plannedEntryId and uploadedEntryId are the same id — those two fields
// represent one virtual entry, not an independent plan plus an unrelated
// upload, so a mirrored drag has to move both together (see
// CalendarMonthGrid) or it leaves a ghost "planned" row behind at the
// origin and strands the moved copy unable to revert via the status
// quick-toggle.
function CalendarSlotEntry({
  isoDate,
  videoType,
  slotTitle,
  status,
  entry,
  mirrorsPlan,
  onLoadEntry,
  onEditPlan,
  onEditUpload,
  onQuickToggle,
  onClear,
  extraClassName,
}) {
  const kind = status === 'planned' || status === 'missed' ? 'planned' : 'uploaded';
  const canClear = kind === 'planned';
  const canDrag = canClear || (kind === 'uploaded' && isFutureUpload(isoDate, status));
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `plan-${isoDate}-${videoType}-${kind}`,
    data: { isoDate, videoType, entryId: entry?.id, kind, mirrorsPlan: kind === 'uploaded' && Boolean(mirrorsPlan) },
    disabled: !canDrag,
  });
  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

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
    (slotTitle ? `${slotTitle} — ` : '') +
    (status === 'uploaded' || status === 'uploaded-drift'
      ? 'Click to clear this upload · Ctrl+Click to set a different one'
      : 'Click to confirm as uploaded · Ctrl+Click to set a different upload');

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`calendar-slot-entry ${STATUS_MODIFIER_CLASS[status]}${canClear ? ' calendar-slot-entry--clearable' : ''}${canDrag ? ' calendar-slot-entry--draggable' : ''}${isDragging ? ' calendar-slot-entry--dragging' : ''}${extraClassName ? ` ${extraClassName}` : ''}`}
    >
      {canDrag && (
        <button
          type="button"
          className="calendar-slot-entry-drag-handle"
          data-tooltip={canClear ? 'Drag to move to another day' : 'Drag to reschedule this upload'}
          aria-label={canClear ? 'Drag to move to another day' : 'Drag to reschedule this upload'}
          {...listeners}
          {...attributes}
        >
          ⠿
        </button>
      )}
      {canClear && (
        <IconButton
          icon="×"
          title="Clear planned song"
          onClick={onClear}
          stopPropagation
          className="tag-reset-button calendar-slot-entry-clear"
        />
      )}
      <button
        type="button"
        className="calendar-slot-entry-title"
        onClick={handleTitleClick}
        data-tooltip={entry ? `${entry.artist} — ${entry.song} · Ctrl+Click to change plan` : undefined}
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
        data-tooltip={statusTitle}
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
              <CalendarSlotDropZone key={slot.slotKey} isoDate={isoDate} videoType={slot.videoType} plannedOccupied={false} uploadedOccupied={false}>
                <button
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
                  data-tooltip={`Click to plan a ${slot.title || slot.videoType} · Ctrl+Click to log an upload`}
                >
                  {(slot.title || slot.videoType).toUpperCase()}
                </button>
              </CalendarSlotDropZone>
            );
          }

          if (slot.status === 'uploaded-drift') {
            return (
              <CalendarSlotDropZone
                key={slot.slotKey}
                isoDate={isoDate}
                videoType={slot.videoType}
                plannedOccupied={Boolean(slot.plannedEntry)}
                uploadedOccupied={Boolean(slot.uploadedEntry)}
              >
                <div className="calendar-slot-group">
                  <CalendarSlotEntry
                    isoDate={isoDate}
                    videoType={slot.videoType}
                    slotTitle={slot.title}
                    status="planned"
                    entry={slot.plannedEntry}
                    onLoadEntry={onLoadEntry}
                    onEditPlan={() => onSlotClick(isoDate, slot.videoType, 'plan')}
                    onEditUpload={() => onSlotClick(isoDate, slot.videoType, 'upload')}
                    onQuickToggle={() => calendar.confirmUploadedAsPlanned(isoDate, slot.videoType)}
                    onClear={() => calendar.clearPlannedEntry(isoDate, slot.videoType)}
                  />
                  <CalendarSlotEntry
                    isoDate={isoDate}
                    videoType={slot.videoType}
                    slotTitle={slot.title}
                    status="uploaded-drift"
                    entry={slot.uploadedEntry}
                    onLoadEntry={onLoadEntry}
                    onEditPlan={() => onSlotClick(isoDate, slot.videoType, 'plan')}
                    onEditUpload={() => onSlotClick(isoDate, slot.videoType, 'upload')}
                    onQuickToggle={() => calendar.clearUploadedEntry(isoDate, slot.videoType)}
                    extraClassName={isFutureUpload(isoDate, 'uploaded-drift') ? 'calendar-slot-entry--scheduled' : undefined}
                  />
                </div>
              </CalendarSlotDropZone>
            );
          }

          const entry = slot.status === 'uploaded' ? slot.uploadedEntry : slot.plannedEntry;
          const mirrorsPlan =
            slot.status === 'uploaded' && Boolean(slot.plannedEntry) && slot.plannedEntry.id === slot.uploadedEntry.id;
          const quickToggle =
            slot.status === 'uploaded'
              ? () => calendar.clearUploadedEntry(isoDate, slot.videoType)
              : () => calendar.confirmUploadedAsPlanned(isoDate, slot.videoType);

          return (
            <CalendarSlotDropZone
              key={slot.slotKey}
              isoDate={isoDate}
              videoType={slot.videoType}
              plannedOccupied={Boolean(slot.plannedEntry)}
              uploadedOccupied={Boolean(slot.uploadedEntry)}
            >
              <CalendarSlotEntry
                isoDate={isoDate}
                videoType={slot.videoType}
                slotTitle={slot.title}
                status={slot.status}
                entry={entry}
                mirrorsPlan={mirrorsPlan}
                onLoadEntry={onLoadEntry}
                onEditPlan={() => onSlotClick(isoDate, slot.videoType, 'plan')}
                onEditUpload={() => onSlotClick(isoDate, slot.videoType, 'upload')}
                onQuickToggle={quickToggle}
                onClear={() => calendar.clearPlannedEntry(isoDate, slot.videoType)}
                extraClassName={isFutureUpload(isoDate, slot.status) ? 'calendar-slot-entry--scheduled' : undefined}
              />
            </CalendarSlotDropZone>
          );
        })}
      </div>
    </div>
  );
}
