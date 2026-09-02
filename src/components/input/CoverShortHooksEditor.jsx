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
}) {
  const canCopyPrompt = !!((formData.artist || '').trim() && (formData.song || '').trim());

  const handleUpdate = (_, update) => {
    setFormData((prev) => ({ ...prev, ...update }));
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
