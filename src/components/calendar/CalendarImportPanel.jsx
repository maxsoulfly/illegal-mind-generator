import { useState } from 'react';

import { buildCalendarImportPrompt, parseCalendarImportResponse } from '../../utils/calendarImportPrompt';
import FormSelect from '../ui/FormSelect';
import { cancelOnEscape } from '../../utils/keyboard';

const VIDEO_TYPE_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
];

// Writes one matched entry to the calendar and tallies the outcome —
// shared by the immediate-apply loop (exact artist+song matches) and the
// confirm-pending loop (song-title-only matches the user picked from).
// Always overwrites uploadedEntryId (YouTube is source of truth) and aligns
// plannedEntryId to match whenever it differs, so an imported row always
// lands as a clean "uploaded," never "uploaded-drift" — a stale pre-import
// plan guess shouldn't survive as a diff flag on real historical data.
// Drift from the manual picker (a human deliberately picking a different
// upload than planned) is untouched — this only applies to imported rows.
function applyImportMatch(calendar, videoType, isoDate, entry, tally) {
  const existingSlot = calendar.getSlot(isoDate, videoType);
  if (!existingSlot?.uploadedEntryId) tally.newCount += 1;
  else if (existingSlot.uploadedEntryId !== entry.id) tally.updatedCount += 1;
  else tally.unchangedCount += 1;

  calendar.setUploadedEntry(isoDate, videoType, entry.id);
  if (existingSlot?.plannedEntryId && existingSlot.plannedEntryId !== entry.id) {
    calendar.setPlannedEntry(isoDate, videoType, entry.id);
  }
}

// Self-contained AI round-trip, same Copy/Paste/Apply/Cancel/summary shape
// as MissingDataTools.jsx/AddTagPanel.jsx — the user screenshots one
// YouTube Studio Content tab (Shorts or Videos), feeds it to an external AI
// with the copied prompt, pastes the reply back here. One videoType per
// batch (matches which tab was screenshotted).
//
// Exact artist+song matches apply immediately. A line matched only by song
// title (artist name differs, e.g. translated/transliterated — "t.A.T.u."
// vs "ТАТУ") is never auto-applied — it's surfaced in a confirmation list
// so the user picks the right song (or skips), same non-silent-guessing
// principle as every candidate list in this app.
function CalendarImportPanel({ savedEntries, calendar }) {
  const [videoType, setVideoType] = useState('short');
  const [promptCopied, setPromptCopied] = useState(false);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [applyResult, setApplyResult] = useState(null);
  const [pendingConfirmations, setPendingConfirmations] = useState([]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildCalendarImportPrompt(videoType));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 500);
  };

  const handleApply = () => {
    const { matches, needsConfirmation, unmatched, skipped, unrecognized } = parseCalendarImportResponse(
      pasteText,
      savedEntries,
    );

    const tally = { newCount: 0, updatedCount: 0, unchangedCount: 0, collisionCount: 0 };
    const seenKeys = new Set();

    matches.forEach(({ isoDate, entry }) => {
      const key = `${isoDate}|${videoType}`;
      if (seenKeys.has(key)) tally.collisionCount += 1;
      seenKeys.add(key);

      applyImportMatch(calendar, videoType, isoDate, entry, tally);
    });

    setApplyResult({ ...tally, skipped, unmatched, unrecognized });
    setPendingConfirmations(
      needsConfirmation.map((item) => ({
        ...item,
        selectedId: item.candidates.length === 1 ? item.candidates[0].id : '',
      })),
    );
    setPasteText('');
  };

  const handleConfirmPending = () => {
    const tally = { newCount: 0, updatedCount: 0, unchangedCount: 0, collisionCount: 0 };
    const seenKeys = new Set();
    let confirmedCount = 0;
    const stillUnmatched = [];

    pendingConfirmations.forEach((item) => {
      const entry = item.candidates.find((candidate) => candidate.id === item.selectedId);

      if (!entry) {
        stillUnmatched.push(item.raw);
        return;
      }

      const key = `${item.isoDate}|${videoType}`;
      if (seenKeys.has(key)) tally.collisionCount += 1;
      seenKeys.add(key);

      applyImportMatch(calendar, videoType, item.isoDate, entry, tally);
      confirmedCount += 1;
    });

    setApplyResult((prev) => ({
      newCount: prev.newCount + tally.newCount,
      updatedCount: prev.updatedCount + tally.updatedCount,
      unchangedCount: prev.unchangedCount + tally.unchangedCount,
      collisionCount: prev.collisionCount + tally.collisionCount,
      confirmedCount: (prev.confirmedCount || 0) + confirmedCount,
      skipped: prev.skipped,
      unmatched: [...prev.unmatched, ...stillUnmatched],
      unrecognized: prev.unrecognized,
    }));
    setPendingConfirmations([]);
  };

  // Same discard-and-collapse the Cancel button does; also reused for
  // Escape-in-the-paste-box. (This panel renders inside a Modal, whose own
  // capture-phase Escape closes the whole modal first — so in practice
  // Escape here dismisses the modal; this keeps the paste box correct if
  // it's ever used outside one. Unapplied text is discarded either way.)
  const handleCancelPaste = () => {
    setShowPasteBox(false);
    setPasteText('');
    setApplyResult(null);
    setPendingConfirmations([]);
  };

  return (
    <>
      <div className="button-row">
        <FormSelect value={videoType} onChange={setVideoType} options={VIDEO_TYPE_OPTIONS} />

        <button type="button" className="button-secondary" onClick={handleCopyPrompt}>
          {promptCopied ? 'Copied ✔️' : 'Copy AI Prompt'}
        </button>

        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            setShowPasteBox((prev) => !prev);
            setApplyResult(null);
            setPendingConfirmations([]);
          }}
        >
          Paste AI Response
        </button>
      </div>

      {showPasteBox && (
        <div className="saved-library-paste-box" onKeyDown={cancelOnEscape(handleCancelPaste)}>
          <textarea
            className="form-input"
            rows={6}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste the AI's reply here, one line per video (YYYY-MM-DD | Artist | Song)..."
          />
          <div className="button-row">
            <button
              type="button"
              className="button-secondary"
              onClick={handleApply}
              disabled={!pasteText.trim()}
            >
              Apply
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={handleCancelPaste}
            >
              Cancel
            </button>
          </div>

          {applyResult && (
            <p className="output-text">
              {applyResult.newCount} new, {applyResult.updatedCount} updated, {applyResult.unchangedCount} unchanged.
              {applyResult.confirmedCount > 0 && ` ${applyResult.confirmedCount} confirmed from song-title matches.`}
              {applyResult.skipped.length > 0 && ` ${applyResult.skipped.length} skipped (no source).`}
              {applyResult.collisionCount > 0 &&
                ` ${applyResult.collisionCount} same-day duplicate${applyResult.collisionCount === 1 ? '' : 's'} collapsed — only the last was kept.`}
              {applyResult.unmatched.length > 0 &&
                ` Couldn't match ${applyResult.unmatched.length} line${applyResult.unmatched.length === 1 ? '' : 's'}: ${applyResult.unmatched.join(' | ')}`}
              {applyResult.unrecognized.length > 0 &&
                ` Unrecognized ${applyResult.unrecognized.length} line${applyResult.unrecognized.length === 1 ? '' : 's'}: ${applyResult.unrecognized.join(' | ')}`}
            </p>
          )}

          {pendingConfirmations.length > 0 && (
            <div className="calendar-import-confirmations">
              <p className="tag-card-subtitle">
                {pendingConfirmations.length} line{pendingConfirmations.length === 1 ? '' : 's'} matched by song title only — the artist name didn't match exactly. Confirm the right song, or leave as Skip.
              </p>
              {pendingConfirmations.map((item, index) => (
                <div key={`${item.isoDate}-${index}`} className="calendar-import-confirmation-row">
                  <span className="output-text">
                    {item.isoDate} — {item.artist} — {item.song}
                  </span>
                  <FormSelect
                    value={item.selectedId}
                    onChange={(value) =>
                      setPendingConfirmations((prev) =>
                        prev.map((p, i) => (i === index ? { ...p, selectedId: value } : p)),
                      )
                    }
                    options={[
                      { value: '', label: 'Skip' },
                      ...item.candidates.map((candidate) => ({
                        value: candidate.id,
                        label: `${candidate.artist} — ${candidate.song}`,
                      })),
                    ]}
                  />
                </div>
              ))}
              <div className="button-row">
                <button type="button" className="button-secondary" onClick={handleConfirmPending}>
                  Confirm Selected
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default CalendarImportPanel;
