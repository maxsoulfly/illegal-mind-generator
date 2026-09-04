import { useEffect, useRef, useState } from 'react';

import SavedEntryRow from '../ui/SavedEntryRow';
import IconButton from '../ui/IconButton';
import { formatDayLabel } from '../../utils/calendarDates';
import { clearOnEscape } from '../../utils/keyboard';

// Inline expandable block, not a modal — no modal component exists anywhere
// in this codebase (see SavedLibrary.jsx's Missing-Data-tools precedent).
// Search is deliberately a small local filter, not useSavedLibraryFilters —
// that hook persists hideQueueHidden/sortBySignal to shared ui storage,
// which would be a surprising side effect for a throwaway picker search box.
//
// Short slots default to the current Shorts Queue as a suggestion list (an
// empty search box shows queue entries only) — but once the user types,
// search widens to the full saved library, same as Long slots (which have
// no queue concept and always search the full library regardless of the
// search box). This split was added 2026-08-06 after live feedback that
// "exclusively queue" made it impossible to plan a Short for a song that
// wasn't already queued.
//
// Two modes, sharing this one component: 'plan' (default) sets/clears
// plannedEntryId; 'upload' sets/clears uploadedEntryId and additionally
// offers a one-click "confirm as planned" shortcut for the common
// non-drift case — picking a *different* song here is what produces the
// uploaded-drift status.
export default function CalendarEntryPicker({
  target,
  savedEntries,
  shortsQueueEntries,
  onRemoveFromQueue,
  calendar,
  onClose,
}) {
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const isUploadMode = target.mode === 'upload';
  const existingSlot = calendar.getSlot(target.isoDate, target.videoType);
  const hasExistingValue = isUploadMode
    ? Boolean(existingSlot?.uploadedEntryId)
    : Boolean(existingSlot?.plannedEntryId);

  const plannedEntry = existingSlot?.plannedEntryId
    ? savedEntries.find((entry) => entry.id === existingSlot.plannedEntryId)
    : null;

  const isShort = target.videoType === 'short';
  const needle = search.toLowerCase().trim();
  const pool = isShort && !needle ? shortsQueueEntries : savedEntries;

  const results = pool.filter((entry) => {
    if (!needle) return true;
    return (
      entry.artist.toLowerCase().includes(needle) ||
      entry.song.toLowerCase().includes(needle)
    );
  });

  function handlePick(entry) {
    if (isUploadMode) {
      calendar.setUploadedEntry(target.isoDate, target.videoType, entry.id);
    } else {
      calendar.setPlannedEntry(target.isoDate, target.videoType, entry.id);
    }
    onClose();
  }

  function handleClear() {
    if (isUploadMode) {
      calendar.clearUploadedEntry(target.isoDate, target.videoType);
    } else {
      calendar.clearPlannedEntry(target.isoDate, target.videoType);
    }
    onClose();
  }

  function handleConfirmAsPlanned() {
    calendar.confirmUploadedAsPlanned(target.isoDate, target.videoType);
    onClose();
  }

  return (
    <div ref={ref} className="calendar-picker terminal-block">
      <div className="calendar-picker-header">
        <h3 className="panel-title">
          {isUploadMode ? 'Confirm Upload' : 'Plan'} {target.videoType.toUpperCase()} —{' '}
          {formatDayLabel(target.isoDate)}
        </h3>
        <div className="calendar-picker-header-actions">
          {hasExistingValue && (
            <button type="button" className="button-secondary" onClick={handleClear}>
              Clear
            </button>
          )}
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      {isUploadMode && plannedEntry && (
        <button type="button" className="button-primary calendar-picker-confirm" onClick={handleConfirmAsPlanned}>
          ✓ Confirm "{plannedEntry.artist} — {plannedEntry.song}" as uploaded
        </button>
      )}

      {isUploadMode && (
        <p className="tag-card-subtitle">
          {plannedEntry
            ? 'Or pick a different song below if what actually went out differs from the plan.'
            : 'Pick which song actually went out.'}
        </p>
      )}

      {!isUploadMode && isShort && !needle && (
        <p className="tag-card-subtitle">Showing your Shorts Queue.</p>
      )}
      {!isUploadMode && isShort && needle && (
        <p className="tag-card-subtitle">Searching your full saved library.</p>
      )}

      <input
        type="search"
        className="form-input"
        placeholder={isShort ? 'Search Shorts Queue — or type to search everything…' : 'Search saved songs…'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={clearOnEscape(search, () => setSearch(''))}
        autoFocus
      />

      <div className="calendar-picker-results">
        {results.map((entry) => (
          <SavedEntryRow
            key={entry.id}
            signal={entry.signalNumber}
            artist={entry.artist}
            song={entry.song}
            tags={entry.transformationTags?.slice(0, 2)}
            onTitleClick={() => handlePick(entry)}
            actions={
              // Only meaningful while actually showing the queue-suggestion
              // list — once search widens to the full library, a result may
              // not be in the queue at all, and per the earlier design
              // decision results are shown identically either way.
              isShort && !needle ? (
                <IconButton
                  icon="×"
                  className="button-secondary"
                  title="Remove from Shorts Queue"
                  onClick={() => onRemoveFromQueue(entry.id)}
                />
              ) : undefined
            }
          />
        ))}
        {!results.length && isShort && !needle && !shortsQueueEntries.length && (
          <p className="tag-summary">
            Your Shorts Queue is empty — randomize it on the Shorts Queue page first.
          </p>
        )}
        {!results.length && !(isShort && !needle && !shortsQueueEntries.length) && (
          <p className="tag-summary">No matching songs.</p>
        )}
      </div>
    </div>
  );
}
