import { useState } from 'react';

import { buildCalendarImportPrompt, parseCalendarImportResponse } from '../../utils/calendarImportPrompt';
import FormSelect from '../ui/FormSelect';

const VIDEO_TYPE_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
];

// Self-contained AI round-trip, same Copy/Paste/Apply/Cancel/summary shape
// as MissingDataTools.jsx/AddTagPanel.jsx — the user screenshots one
// YouTube Studio Content tab (Shorts or Videos), feeds it to an external AI
// with the copied prompt, pastes the reply back here. One videoType per
// batch (matches which tab was screenshotted), always written via
// calendar.setUploadedEntry — YouTube data is treated as source of truth,
// so an existing slot's upload is overwritten, never skipped. Also aligns
// plannedEntryId to match whenever it differs, so an imported row always
// lands as a clean "uploaded," never "uploaded-drift" — a stale pre-import
// plan guess shouldn't survive as a diff flag on real historical data.
// Drift from the manual picker (a human deliberately picking a different
// upload than planned) is untouched — this only applies to imported rows.
function CalendarImportPanel({ savedEntries, calendar }) {
  const [videoType, setVideoType] = useState('short');
  const [promptCopied, setPromptCopied] = useState(false);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [applyResult, setApplyResult] = useState(null);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildCalendarImportPrompt(videoType));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 500);
  };

  const handleApply = () => {
    const { matches, unmatched, skipped, unrecognized } = parseCalendarImportResponse(pasteText, savedEntries);

    const seenKeys = new Set();
    let collisionCount = 0;
    let newCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;

    matches.forEach(({ isoDate, entry }) => {
      const key = `${isoDate}|${videoType}`;
      if (seenKeys.has(key)) collisionCount += 1;
      seenKeys.add(key);

      const existingSlot = calendar.getSlot(isoDate, videoType);
      if (!existingSlot?.uploadedEntryId) newCount += 1;
      else if (existingSlot.uploadedEntryId !== entry.id) updatedCount += 1;
      else unchangedCount += 1;

      calendar.setUploadedEntry(isoDate, videoType, entry.id);
      if (existingSlot?.plannedEntryId && existingSlot.plannedEntryId !== entry.id) {
        calendar.setPlannedEntry(isoDate, videoType, entry.id);
      }
    });

    setApplyResult({ newCount, updatedCount, unchangedCount, collisionCount, skipped, unmatched, unrecognized });
    setPasteText('');
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
          }}
        >
          Paste AI Response
        </button>
      </div>

      {showPasteBox && (
        <div className="saved-library-paste-box">
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
              onClick={() => {
                setShowPasteBox(false);
                setPasteText('');
                setApplyResult(null);
              }}
            >
              Cancel
            </button>
          </div>

          {applyResult && (
            <p className="output-text">
              {applyResult.newCount} new, {applyResult.updatedCount} updated, {applyResult.unchangedCount} unchanged.
              {applyResult.skipped.length > 0 && ` ${applyResult.skipped.length} skipped (no source).`}
              {applyResult.collisionCount > 0 &&
                ` ${applyResult.collisionCount} same-day duplicate${applyResult.collisionCount === 1 ? '' : 's'} collapsed — only the last was kept.`}
              {applyResult.unmatched.length > 0 &&
                ` Couldn't match ${applyResult.unmatched.length} line${applyResult.unmatched.length === 1 ? '' : 's'}: ${applyResult.unmatched.join(' | ')}`}
              {applyResult.unrecognized.length > 0 &&
                ` Unrecognized ${applyResult.unrecognized.length} line${applyResult.unrecognized.length === 1 ? '' : 's'}: ${applyResult.unrecognized.join(' | ')}`}
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default CalendarImportPanel;
