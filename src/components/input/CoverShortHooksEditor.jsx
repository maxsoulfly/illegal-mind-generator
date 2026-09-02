import { useState } from 'react';

import TagPhraseEditor from '../tags/TagPhraseEditor';
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
export default function CoverShortHooksEditor({ formData, setFormData, projectConfig }) {
  const [promptCopied, setPromptCopied] = useState(false);
  const canCopyPrompt = !!((formData.artist || '').trim() && (formData.song || '').trim());

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildCoverHookPrompt(formData, projectConfig));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 500);
  };

  return (
    <>
      <div className="button-row">
        <button
          type="button"
          className="button-secondary"
          onClick={handleCopyPrompt}
          disabled={!canCopyPrompt}
          data-tooltip={canCopyPrompt ? undefined : 'Enter an artist and song first'}
        >
          {promptCopied ? 'Copied ✔️' : 'Copy AI Prompt'}
        </button>
      </div>

      <TagPhraseEditor
        noWrapper
        title="Cover-Specific Hooks"
        tagName="__cover__"
        field="coverShortHooks"
        phrases={formData.coverShortHooks || []}
        placeholders={buildHookPlaceholders(projectConfig)}
        onUpdateTag={(_, update) => setFormData((prev) => ({ ...prev, ...update }))}
      />
    </>
  );
}
