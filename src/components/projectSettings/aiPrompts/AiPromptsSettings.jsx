import { useState, useSyncExternalStore } from 'react';

import FormField from '../../ui/FormField';
import FormSelect from '../../ui/FormSelect';
import SubTabNav from '../../ui/SubTabNav';
import CopyPromptButton from '../../ui/CopyPromptButton';
import { AI_PROMPTS, getPromptDef } from '../../../utils/aiPromptRegistry';
import {
  getPromptOverride,
  updatePromptOverridePatch,
  resetPromptOverridePatch,
} from '../../../utils/aiPromptOverrides';
import { buildPromptClipboardText, parsePromptClipboardText } from '../../../utils/aiPromptClipboard';
import { getDraftEntry, setDraftEntry, clearDraftEntry, subscribe } from '../../../utils/aiPromptDraftStore';

const PROMPT_OPTIONS = AI_PROMPTS.map((p) => ({ value: p.id, label: p.label }));

const TABS = [
  { id: 'edit', label: 'Edit' },
  { id: 'revision', label: 'AI Revision' },
  { id: 'preview', label: 'Preview' },
];

function defaultFields(promptDef) {
  const fields = {};
  promptDef.fields.forEach((field) => {
    fields[field.key] = field.default;
  });
  return fields;
}

// The last-saved version of a prompt's fields: its saved override (if any)
// merged onto the registry defaults, field by field — a field absent from a
// saved override (e.g. it predates a newly-added field) falls back to its
// own default rather than the whole prompt falling back.
function effectiveFields(promptDef, savedOverride) {
  const fields = defaultFields(promptDef);
  if (savedOverride) {
    promptDef.fields.forEach((field) => {
      if (field.key in savedOverride) fields[field.key] = savedOverride[field.key];
    });
  }
  return fields;
}

function fieldsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Edit the reusable instructions behind this project's AI-assisted prompts
// (Content Setup -> AI Prompts). Dynamic song/tag/context data is never
// editable here — only the hardcoded wording each prompt builder falls back
// to when no override is saved. See aiPromptRegistry.js to add a prompt,
// aiPromptOverrides.js for the storage convention, aiPromptClipboard.js for
// the copy/paste round-trip, aiPromptDraftStore.js for why unsaved drafts
// are kept outside React state.
export default function AiPromptsSettings({
  projectId,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
  formData = {},
}) {
  const [selectedPromptId, setSelectedPromptId] = useState(AI_PROMPTS[0].id);
  const [activeTab, setActiveTab] = useState('edit');
  const [saved, setSaved] = useState(false);

  const promptDef = getPromptDef(selectedPromptId);
  const draftKey = `${projectId}:${selectedPromptId}`;
  const savedOverride = getPromptOverride(projectSettingsOverrides, selectedPromptId);
  const lastSaved = effectiveFields(promptDef, savedOverride);

  // External store, not useState — survives a project switch (which
  // unmounts this whole component via App.jsx's loading gate). See
  // aiPromptDraftStore.js.
  const storeEntry = useSyncExternalStore(subscribe, () => getDraftEntry(draftKey));
  const draft = storeEntry?.fields ?? lastSaved;
  const pasteText = storeEntry?.pasteText ?? '';
  const applySummary = storeEntry?.applySummary ?? null;

  const hasSavedOverride = !!savedOverride;
  const isDirty = !fieldsEqual(draft, lastSaved);

  function writeEntry(patch) {
    setDraftEntry(draftKey, { fields: draft, pasteText, applySummary, ...patch });
  }

  function updateDraftField(key, value) {
    writeEntry({ fields: { ...draft, [key]: value } });
    setSaved(false);
  }

  function handleSelectPrompt(nextId) {
    setSelectedPromptId(nextId);
    setActiveTab('edit');
    setSaved(false);
  }

  function handleSave() {
    updateProjectOverride(updatePromptOverridePatch(projectSettingsOverrides, selectedPromptId, draft));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  // Abandons unsaved edits, reverting the draft to whatever is currently
  // persisted (a saved override if one exists, otherwise the built-in
  // default) — does NOT touch the saved override itself.
  function handleDiscardChanges() {
    clearDraftEntry(draftKey);
    setSaved(false);
  }

  // Deletes the saved override entirely for THIS prompt only, reverting to
  // the built-in hardcoded default. Also clears any unsaved draft, since
  // there's nothing meaningful left to keep from it.
  function handleRestoreDefault() {
    updateProjectOverride(resetPromptOverridePatch(projectSettingsOverrides, selectedPromptId));
    clearDraftEntry(draftKey);
    setSaved(false);
  }

  function handleApplyPaste() {
    const result = parsePromptClipboardText(promptDef, pasteText);
    writeEntry({ fields: { ...draft, ...result.fields }, applySummary: result });
    setSaved(false);
  }

  // "Full Prompt Preview" — the real output of the real builder, with the
  // draft (not yet saved) spliced into a local copy of the resolved config,
  // and either the currently-loaded Generator song or sample data.
  const hasRealSong = !!(formData?.artist?.trim() && formData?.song?.trim());
  const previewFormData = hasRealSong ? formData : promptDef.sampleFormData;
  const previewProjectConfig = {
    ...projectConfig,
    aiPromptOverrides: {
      ...(projectConfig?.aiPromptOverrides || {}),
      [selectedPromptId]: draft,
    },
  };
  const fullPromptPreview = promptDef.buildFullPrompt(previewFormData, previewProjectConfig);

  return (
    <section>
      <h2 className="panel-title">AI Prompts</h2>

      <div className="ai-prompts-header">
        <FormSelect value={selectedPromptId} onChange={handleSelectPrompt} options={PROMPT_OPTIONS} />
        <span className="tag-status">Project: {projectConfig?.name || projectId}</span>
        <span className="tag-status">{hasSavedOverride ? 'Modified' : 'Default'}</span>
        {isDirty && <span className="ai-prompts-unsaved-indicator">● Unsaved changes</span>}
      </div>

      <SubTabNav className="content-setup-subnav" tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'edit' && (
        <div className="ai-prompts-tab-content">
          {promptDef.fields.map((field) => (
            <FormField
              key={field.key}
              label={field.type === 'list' ? `${field.label} (one per line)` : field.label}
            >
              <textarea
                className="form-input ai-prompt-field-textarea"
                rows={field.type === 'list' ? 8 : 4}
                value={field.type === 'list' ? (draft[field.key] || []).join('\n') : draft[field.key] || ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  updateDraftField(field.key, field.type === 'list' ? raw.split('\n') : raw);
                }}
              />
            </FormField>
          ))}
        </div>
      )}

      {activeTab === 'revision' && (
        <div className="ai-prompts-tab-content">
          <div className="button-row">
            <CopyPromptButton
              getPrompt={() => buildPromptClipboardText(promptDef, draft)}
              label="Copy for AI Revision"
            />
          </div>

          <FormField label="Paste AI Revision">
            <textarea
              className="form-input ai-prompt-field-textarea"
              rows={8}
              value={pasteText}
              onChange={(e) => writeEntry({ pasteText: e.target.value })}
              placeholder="Paste the AI's revised reply here, then click Apply to Draft to review it in the Edit tab before saving..."
            />
          </FormField>
          <div className="button-row">
            <button
              type="button"
              className="button-secondary"
              onClick={handleApplyPaste}
              disabled={!pasteText.trim()}
            >
              Apply to Draft
            </button>
          </div>

          {applySummary && (
            <p className="output-text">
              {applySummary.missing.length === 0 && applySummary.unrecognized.length === 0
                ? 'Applied to draft — every expected section was found. Review it in the Edit tab, then click Save.'
                : null}
              {applySummary.missing.length > 0 &&
                `Missing section${applySummary.missing.length === 1 ? '' : 's'} (left unchanged): ${applySummary.missing.join(', ')}. `}
              {applySummary.unrecognized.length > 0 &&
                `Text that didn't match a known section (not applied — copy it in by hand if it's real content): ${applySummary.unrecognized.join(' | ')}`}
            </p>
          )}
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="ai-prompts-tab-content">
          <p className="tag-card-subtitle">
            {hasRealSong
              ? 'Using your currently-loaded song from the Generator.'
              : 'Using sample data — load a song in the Generator to preview with real values.'}
          </p>
          <div className="prompt-block ai-prompt-preview-panel">{fullPromptPreview}</div>
        </div>
      )}

      <div className="button-row ai-prompts-actions">
        <button type="button" className="button-primary" onClick={handleSave} disabled={!isDirty}>
          {saved ? 'Saved ✔️' : 'Save'}
        </button>
        <button type="button" className="button-secondary" onClick={handleDiscardChanges} disabled={!isDirty}>
          Discard Changes
        </button>
        <button type="button" className="button-secondary" onClick={handleRestoreDefault}>
          Restore Default
        </button>
      </div>
    </section>
  );
}
