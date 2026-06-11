import CopyButton from '../CopyButton';
import NavLinkButton from '../ui/NavLinkButton';

function getHookText(hook) {
  return typeof hook === 'string' ? hook : hook.text;
}

function formatHookType(type) {
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function getHookTooltip(hook) {
  if (typeof hook === 'string') return '';

  const hookType = formatHookType(hook.hookType);
  const sourceText = hook.sourceText ? `: "${hook.sourceText}"` : '';

  if (hook.sourceType === 'tag') {
    return `${hook.sourceTag} (${hookType})${sourceText}`;
  }

  return `Project preset (${hookType})${sourceText}`;
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
              <NavLinkButton
                title={getHookTooltip(hook)}
                onClick={() => onOpenSourceTag?.({ tagName: hook.sourceTag, hookType: hook.hookType, hookText: hook.sourceText || hookText })}
              >
                {hookText}
              </NavLinkButton>
            ) : baseHook ? (
              <NavLinkButton
                muted
                title={getHookTooltip(hook)}
                onClick={() => onOpenSourceHook?.({ hookType: hook.hookType, sourceText: hook.sourceText || hookText })}
              >
                {hookText}
              </NavLinkButton>
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
