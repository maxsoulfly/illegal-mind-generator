import CopyButton from '../CopyButton';

function getHookTooltip(hook) {
  if (typeof hook === 'string') return '';

  if (hook.sourceType === 'tag') {
    return `Generated from tag: ${hook.sourceTag} (${hook.hookType})`;
  }

  return `Generated from project ${hook.hookType} hooks`;
}

function ShortHookTitles({ title, hooks }) {
  return (
    <div className="generated-pair terminal-block">
      <h3 className="saved-entry-signal">{title}</h3>

      {hooks.map((hook, index) => {
        const hookText = typeof hook === 'string' ? hook : hook.text;

        return (
          <div key={index} className="generated-pair-row">
            <p className="generated-pair-text" title={getHookTooltip(hook)}>
              {hookText}
            </p>

            <CopyButton text={hookText} />
          </div>
        );
      })}
    </div>
  );
}

export default ShortHookTitles;
