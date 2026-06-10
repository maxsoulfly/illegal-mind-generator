import CopyButton from '../CopyButton';

function getHookText(hook) {
  return typeof hook === 'string' ? hook : hook.text;
}

function formatHookType(type) {
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function getHookTooltip(hook) {
  if (typeof hook === 'string') return '';

  const hookType = formatHookType(hook.hookType);

  if (hook.sourceType === 'tag') {
    return `Generated from tag: ${hook.sourceTag} (${hookType})`;
  }

  return `Generated from project preset (${hookType})`;
}

function isTagHook(hook) {
  return typeof hook !== 'string' && hook.sourceType === 'tag';
}

function isBaseHook(hook) {
  return typeof hook !== 'string' && hook.sourceType === 'base';
}

function ShortHookTitles({ title, hooks, onOpenSourceTag, onOpenSourceHook }) {
  return (
    <div className="generated-pair terminal-block">
      <h3 className="saved-entry-signal">{title}</h3>

      {hooks.map((hook, index) => {
        const hookText = getHookText(hook);
        const tagHook = isTagHook(hook);
        const baseHook = isBaseHook(hook);

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
                    hookText: hook.sourceText || hookText,
                  })
                }
              >
                {hookText}
              </button>
            ) : baseHook ? (
              <button
                type="button"
                className="queue-entry-link generated-pair-text generated-pair-link"
                title={getHookTooltip(hook)}
                onClick={() =>
                  onOpenSourceHook?.({
                    hookType: hook.hookType,
                    sourceText: hook.sourceText || hookText,
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
