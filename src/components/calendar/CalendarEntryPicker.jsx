import { useEffect, useRef, useState } from 'react';

import SavedEntryRow from '../ui/SavedEntryRow';
import { formatDayLabel } from '../../utils/calendarDates';

// Inline expandable block, not a modal — no modal component exists anywhere
// in this codebase (see SavedLibrary.jsx's Missing-Data-tools precedent).
// Search is deliberately a small local filter, not useSavedLibraryFilters —
// that hook persists hideQueueHidden/sortBySignal to shared ui storage,
// which would be a surprising side effect for a throwaway picker search box.
//
// Short slots pick exclusively from the current Shorts Queue, not the full
// library — Shorts are meant to come from whatever's already queued up;
// Long slots (no queue concept exists for them) search the full library.
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
  const pool = isShort ? shortsQueueEntries : savedEntries;

  const needle = search.toLowerCase().trim();
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

      {!isUploadMode && isShort && <p className="tag-card-subtitle">Showing your Shorts Queue.</p>}

      <input
        type="search"
        className="form-input"
        placeholder={isShort ? 'Search Shorts Queue…' : 'Search saved songs…'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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
          />
        ))}
        {!results.length && isShort && !pool.length && (
          <p className="tag-summary">
            Your Shorts Queue is empty — randomize it on the Shorts Queue page first.
          </p>
        )}
        {!results.length && (!isShort || pool.length > 0) && (
          <p className="tag-summary">No matching songs.</p>
        )}
      </div>
    </div>
  );
}
