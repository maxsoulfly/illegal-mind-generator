import CopyButton from '../CopyButton';

function getHookText(hook) {
  return typeof hook === 'string' ? hook : hook.text;
}

function getHookTooltip(hook) {
  if (typeof hook === 'string') return '';

  if (hook.sourceType === 'tag') {
    return `Generated from tag: ${hook.sourceTag} (${hook.hookType})`;
  }

  return `Generated from project ${hook.hookType} hooks`;
}

function isTagHook(hook) {
  return typeof hook !== 'string' && hook.sourceType === 'tag';
}

function ShortHookTitles({ title, hooks, onOpenSourceTag }) {
  return (
    <div className="generated-pair terminal-block">
      <h3 className="saved-entry-signal">{title}</h3>

      {hooks.map((hook, index) => {
        const hookText = getHookText(hook);
        const tagHook = isTagHook(hook);

        return (
          <div key={index} className="generated-pair-row">
            {tagHook ? (
              <button
                type="button"
                className="queue-entry-link generated-pair-text generated-pair-link"
                title={getHookTooltip(hook)}
                onClick={() =>
                  onOpenSourceTag?.({
                    tagName: hook.sourceTag,
                    hookType: hook.hookType,
                    hookText,
                  })
                }
              >
                {hookText}
              </button>
            ) : (
              <p className="generated-pair-text" title={getHookTooltip(hook)}>
                {hookText}
              </p>
            )}

            <CopyButton text={hookText} />
          </div>
        );
      })}
    </div>
  );
}

export default ShortHookTitles;
