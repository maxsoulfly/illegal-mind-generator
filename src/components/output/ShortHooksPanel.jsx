import ToggleButton from '../ui/ToggleButton';
import ShortHookTitles from './ShortHookTitles';

const SHORT_HOOK_TITLE_LIMIT = 5;

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildMixedShortHooks(shortHooks) {
  return shuffleArray(
    shortHooks.flatMap((group) =>
      group.hooks.map((hook) => ({
        ...hook,
        hookTypeLabel: group.label,
      })),
    ),
  ).slice(0, SHORT_HOOK_TITLE_LIMIT);
}

function ShortHooksPanel({
  shortHooks,
  panelVisibility,
  togglePanel,
  onOpenSourceTag,
}) {
  if (!shortHooks?.length) return null;

  const mixedShortHooks = buildMixedShortHooks(shortHooks);

  return (
    <div
      className={`panel ${panelVisibility.shortHooks ? '' : 'panel-collapsed'}`}
    >
      <div className="panel-header">
        <h2 className="panel-title">Short Hooks</h2>
        <ToggleButton
          isOpen={panelVisibility.shortHooks}
          onClick={() => togglePanel('shortHooks')}
          label="Short Hooks"
          compact
        />
      </div>

      {panelVisibility.shortHooks && (
        <ShortHookTitles
          title="Best Shorts Title Candidates"
          hooks={mixedShortHooks}
          onOpenSourceTag={onOpenSourceTag}
        />
      )}
    </div>
  );
}

export default ShortHooksPanel;
