import ShortHookTitles from './ShortHookTitles';
import CollapsiblePanel from '../ui/CollapsiblePanel';

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
    <CollapsiblePanel
      label="Short Hooks"
      visible={panelVisibility.shortHooks}
      onToggle={() => togglePanel('shortHooks')}
    >
      <ShortHookTitles
        title="Best Shorts Title Candidates"
        hooks={mixedShortHooks}
        onOpenSourceTag={onOpenSourceTag}
      />
    </CollapsiblePanel>
  );
}

export default ShortHooksPanel;
