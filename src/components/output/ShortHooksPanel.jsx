import ShortHookTitles from './ShortHookTitles';
import CollapsiblePanel from '../ui/CollapsiblePanel';

const SHORT_HOOK_TITLE_LIMIT = 5;

function ShortHooksPanel({
  shortHooks,
  panelVisibility,
  togglePanel,
  onOpenSourceTag,
}) {
  // See TitlesPanel.jsx — shortHooks.mixed is already a frozen order, so a
  // plain slice here can't reshuffle on an unrelated live re-render.
  const mixedShortHooks = shortHooks?.mixed?.slice(0, SHORT_HOOK_TITLE_LIMIT) ?? [];

  if (!mixedShortHooks.length) return null;

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
