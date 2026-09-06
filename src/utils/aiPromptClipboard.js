// Copy/paste round-trip for the AI Prompts settings editor. Generic over
// promptDef.fields (aiPromptRegistry.js), so it works unmodified for future
// prompts too — no per-prompt parsing code. Same "plain text, labeled
// sections, no JSON" convention src/utils/tagPrompt.js's buildTagPrompt/
// parseTagResponse already established for a similar edit-via-external-AI
// round-trip, just with 2-4 sections instead of ~10.
//
// This module never persists anything — parsePromptClipboardText only
// reports what it found (mirrors parseTagResponse/parseMissingDataResponse's
// "parse, don't decide" separation); the caller (AiPromptsSettings.jsx) owns
// merging found fields into draft state and showing the user what was
// missing or unrecognized before any Save happens.

function fieldHeader(field) {
  return `${field.label.toUpperCase()}:`;
}

// The fixed instruction preamble sent to the external AI, explaining the
// task and the exact shape it must reply in. Not user-editable — it's how
// the round-trip stays parseable, not prompt content itself.
const CLIPBOARD_PREAMBLE =
  "Please revise the sections below, which are the editable instructions for one of my app's AI prompts. Keep each section's header line EXACTLY as shown (all caps, ending in a colon), revise only the text under it, and reply with the whole thing back in this same format — one revised section per header, nothing else added or removed, no extra commentary before or after.";

// draftFields: { [field.key]: string | string[] } — current in-memory draft
// values (already defaulted to each field's registry default where unset).
export function buildPromptClipboardText(promptDef, draftFields) {
  const sections = promptDef.fields.map((field) => {
    const value = draftFields[field.key];
    const body =
      field.type === 'list' ? (value || []).join('\n') : String(value || '');
    return `${fieldHeader(field)}\n${body}`;
  });

  return [CLIPBOARD_PREAMBLE, ...sections].join('\n\n');
}

// Returns { fields, missing, unrecognized }:
//  - fields: only the field keys actually found in the pasted text, with
//    their parsed value (string for 'paragraph', string[] for 'list').
//  - missing: registry field labels whose header never appeared at all.
//  - unrecognized: any non-empty line that didn't fall under a recognized
//    header (echoed preamble, stray commentary, a misspelled/altered header)
//    — surfaced verbatim so the caller can show it, never silently dropped.
export function parsePromptClipboardText(promptDef, text) {
  const headerToField = new Map(
    promptDef.fields.map((field) => [fieldHeader(field).toUpperCase(), field]),
  );

  const fields = {};
  const unrecognized = [];
  let currentField = null;

  (text || '')
    .split('\n')
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) return;

      const matchedField = headerToField.get(line.toUpperCase());
      if (matchedField) {
        currentField = matchedField;
        fields[currentField.key] = currentField.type === 'list' ? [] : '';
        return;
      }

      if (!currentField) {
        unrecognized.push(line);
        return;
      }

      if (currentField.type === 'list') {
        fields[currentField.key].push(line);
      } else {
        fields[currentField.key] = fields[currentField.key]
          ? `${fields[currentField.key]} ${line}`
          : line;
      }
    });

  const missing = promptDef.fields
    .filter((field) => !(field.key in fields))
    .map((field) => field.label);

  return { fields, missing, unrecognized };
}
