import { useState } from 'react';

// Shared "Copy AI Prompt" button for phrase-pool editors (cover-specific
// Short Hooks, a tag's Short Hooks category, a global Short Hook type, a Title
// template group). Builds the prompt lazily on click via `getPrompt`, copies
// it to the clipboard, and shows a brief "Copied ✔️" confirmation — 500ms,
// same timing as CopyButton.
//
// Pass `disabled` + `disabledTooltip` when the editor's inputs aren't ready
// (e.g. no artist/song yet on the cover editor). The prompt text itself comes
// from src/utils/authorPromptContexts.js via buildAuthorPrompt — this
// component owns only the click/copied-state/button chrome.
export default function CopyPromptButton({
  getPrompt,
  disabled = false,
  disabledTooltip,
  label = 'Copy AI Prompt',
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(getPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  };

  return (
    <button
      type="button"
      className="button-secondary"
      onClick={handleClick}
      disabled={disabled}
      data-tooltip={disabled ? disabledTooltip : undefined}
    >
      {copied ? 'Copied ✔️' : label}
    </button>
  );
}
