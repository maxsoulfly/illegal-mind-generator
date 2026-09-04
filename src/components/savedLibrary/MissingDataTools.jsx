import { useState } from 'react';

import { buildMissingDataPrompt, parseMissingDataResponse } from '../../utils/searchQuery';
import { cancelOnEscape } from '../../utils/keyboard';

// Batch size for the "Copy AI Prompt" action — capped so a single prompt
// stays a manageable size for an AI to answer accurately in one go.
const MISSING_DATA_PROMPT_BATCH_SIZE = 10;

// Self-contained AI round-trip for filling in missing Year/Genre data:
// copy a prompt for the next batch of incomplete songs, then paste the
// AI's reply back to non-destructively fill only the empty fields.
function MissingDataTools({ missingEntries, savedEntries, onUpdateEntry }) {
  const [promptCopied, setPromptCopied] = useState(false);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [applyResult, setApplyResult] = useState(null);

  const missingBatch = missingEntries.slice(0, MISSING_DATA_PROMPT_BATCH_SIZE);

  const handleCopyMissingDataPrompt = () => {
    navigator.clipboard.writeText(buildMissingDataPrompt(missingBatch));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 500);
  };

  // Non-destructive by design: only fills a field that's currently empty,
  // never overwrites data the user already has, mirroring the same
  // "don't clobber real data" policy the Import merge fix established.
  const handleApplyPastedResponse = () => {
    const { matches, unmatched } = parseMissingDataResponse(pasteText, savedEntries);

    let updatedCount = 0;
    let skippedCount = 0;

    matches.forEach(({ entry, originalYear, originalGenre }) => {
      const updates = {};
      if (!entry.originalYear && originalYear) updates.originalYear = originalYear;
      if (!entry.originalGenre && originalGenre) updates.originalGenre = originalGenre;

      if (Object.keys(updates).length > 0) {
        onUpdateEntry(entry.id, updates);
        updatedCount += 1;
      } else {
        skippedCount += 1;
      }
    });

    setApplyResult({ updatedCount, skippedCount, unmatched });
    setPasteText('');
  };

  // Same discard-and-collapse the Cancel button does; also reused for
  // Escape-in-the-paste-box.
  const handleCancelPaste = () => {
    setShowPasteBox(false);
    setPasteText('');
    setApplyResult(null);
  };

  return (
    <>
      <div className="button-row">
        <button
          type="button"
          className="button-secondary"
          onClick={handleCopyMissingDataPrompt}
        >
          {promptCopied
            ? 'Copied ✔️'
            : `Copy AI Prompt (${missingBatch.length} of ${missingEntries.length} missing)`}
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
        <div className="saved-library-paste-box" onKeyDown={cancelOnEscape(handleCancelPaste)}>
          <textarea
            className="form-input"
            rows={6}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste the AI's reply here, one line per song (Artist - Song: Year, Genre1, Genre2)..."
          />
          <div className="button-row">
            <button
              type="button"
              className="button-secondary"
              onClick={handleApplyPastedResponse}
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
              Updated {applyResult.updatedCount} song
              {applyResult.updatedCount === 1 ? '' : 's'}.
              {applyResult.skippedCount > 0 &&
                ` ${applyResult.skippedCount} already had data.`}
              {applyResult.unmatched.length > 0 &&
                ` Couldn't match ${applyResult.unmatched.length} line${applyResult.unmatched.length === 1 ? '' : 's'}: ${applyResult.unmatched.join(' | ')}`}
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default MissingDataTools;
