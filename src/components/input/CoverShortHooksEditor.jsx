import TagPhraseEditor from '../tags/TagPhraseEditor';
import CopyPromptButton from '../ui/CopyPromptButton';
import { buildHookPlaceholders } from '../../utils/hookPlaceholders';
import { buildCoverHookPrompt } from '../../utils/coverPrompt';

// Editor for formData.coverShortHooks — a flat, uncategorized list of Short
// Hooks unique to the loaded cover (personal story, why it was covered, an
// unusual recording/arrangement/song-part detail, an anecdote). These join
// the normal Short Hook candidate pool for that cover (see
// generateShortHooks.js's `cover` group). NOT the shelved Generation V2
// composition engine.
//
// Reuses TagPhraseEditor (noWrapper) for the exact add / edit / delete /
// bulk-add mechanics the Tag Editor's Short Hooks tab uses. With
// `parentField` undefined, its buildUpdate returns { coverShortHooks: [...] },
// which the onUpdateTag adapter spreads straight into formData (the first
// arg — a tag name in the Tag Editor — is unused here).
//
// coverHookTarget/clearCoverHookTarget (from useNavigationTargets'
// openCoverHook): clicking a cover-specific hook in the Titles / Short Hooks
// output force-opens this section (handled by openCoverHook) and passes the
// raw hook text here as `highlightText` — TagPhraseEditor already scrolls to
// and highlights the matching PhraseRow (`phrase === highlightText`). The
// highlight is "consumed" once the user actually edits the list.
export default function CoverShortHooksEditor({
  formData,
  setFormData,
  projectConfig,
  coverHookTarget,
  clearCoverHookTarget,
  // Auto-persist a hook change straight to the saved entry (add / bulk /
  // delete / edit-blur) — a no-op for an unsaved song. See
  // GeneratorPage.jsx's `persistCoverHooks`. The setFormData below still
  // runs unconditionally, so formData.coverShortHooks stays authoritative
  // and an explicit SAVE later can't revert it.
  onPersistCoverHooks,
}) {
  const canCopyPrompt = !!((formData.artist || '').trim() && (formData.song || '').trim());

  // A reply from the Cover-Specific Short Hooks AI prompt may be exactly the
  // zero-hook sentinel `NONE` (single line, nothing else) when the Cover
  // Context genuinely supports no worthwhile hook — see
  // authorPromptContexts.js's coverShortHooksContext. Drop any entry whose
  // trimmed value is exactly `NONE` (case-insensitive) before it's applied
  // or persisted, so a lone `NONE` paste adds zero hooks and a stray `NONE`
  // line mixed into a real bulk-add is dropped while the rest still save.
  // Scoped to this one editor's adapter — TagPhraseEditor itself (the ~15
  // Tag Editor call sites) is untouched; a tag phrase literally "NONE"
  // still saves there.
  const isNoneSentinel = (hook) => (hook || '').trim().toUpperCase() === 'NONE';

  const handleUpdate = (_, update) => {
    const sanitizedUpdate = Array.isArray(update.coverShortHooks)
      ? { ...update, coverShortHooks: update.coverShortHooks.filter((hook) => !isNoneSentinel(hook)) }
      : update;

    setFormData((prev) => ({ ...prev, ...sanitizedUpdate }));
    if (Array.isArray(sanitizedUpdate.coverShortHooks)) {
      onPersistCoverHooks?.(sanitizedUpdate.coverShortHooks);
    }
    if (coverHookTarget) clearCoverHookTarget?.();
  };

  return (
    <TagPhraseEditor
      noWrapper
      searchable
      title="Cover-Specific Hooks"
      tagName="__cover__"
      field="coverShortHooks"
      phrases={formData.coverShortHooks || []}
      placeholders={buildHookPlaceholders(projectConfig)}
      onUpdateTag={handleUpdate}
      highlightText={coverHookTarget?.hookText ?? null}
      actionsSlot={
        <CopyPromptButton
          getPrompt={() => buildCoverHookPrompt(formData, projectConfig)}
          disabled={!canCopyPrompt}
          disabledTooltip="Enter an artist and song first"
        />
      }
    />
  );
}
