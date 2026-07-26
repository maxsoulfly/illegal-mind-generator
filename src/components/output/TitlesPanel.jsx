import ShortHookTitles from './ShortHookTitles';
import GeneratedTitle from './GeneratedTitle';
import CollapsiblePanel from '../ui/CollapsiblePanel';
import ToggleField from '../ui/ToggleField';

function TitlesPanel({
  titles,
  panelVisibility,
  togglePanel,
  shortHooks,
  videoType,
  titleCount,
  onOpenSourceTag,
  onOpenSourceHook,
  onOpenSourceTemplate,
  onNavigateToSettings,
  useHooksForLongTitles,
  onToggleHooksForLongTitles,
  titleUppercase,
  onToggleTitleUppercase,
}) {
  // shortHooks.mixed is already a frozen, shuffled-across-types order (see
  // generateShortHooks.js's pickShortHooks) — slicing it here is a plain,
  // non-random truncation, so which 5 titles show can't change just because
  // a live form edit produced a new shortHooks object with fresh text.
  const mixedShortTitles = shortHooks?.mixed?.slice(0, titleCount ?? 5) ?? [];
  const isShorts = videoType === 'Shorts';

  return (
    <CollapsiblePanel
      label="Titles"
      visible={panelVisibility.titles}
      onToggle={() => togglePanel('titles')}
      onNavigate={onNavigateToSettings ? () => onNavigateToSettings('titles') : undefined}
    >
      <div className="titles-options-row">
        {/* Only show the hooks toggle for long video mode — Shorts already use hooks directly. */}
        {!isShorts && (
          <ToggleField
            label="Hooks"
            title="Mix shorts hooks into long title candidates"
            checked={useHooksForLongTitles}
            onChange={onToggleHooksForLongTitles}
          />
        )}

        <ToggleField
          label="Uppercase"
          checked={titleUppercase}
          onChange={onToggleTitleUppercase}
        />
      </div>

      <div>
        {isShorts ? (
          <ShortHookTitles
            hooks={mixedShortTitles}
            onOpenSourceTag={onOpenSourceTag}
            onOpenSourceHook={onOpenSourceHook}
            uppercase={titleUppercase}
          />
        ) : (
          titles.map((title, index) => (
            <GeneratedTitle
              key={index}
              title={title}
              onOpenSourceTag={onOpenSourceTag}
              onOpenSourceHook={onOpenSourceHook}
              onOpenSourceTemplate={onOpenSourceTemplate}
              uppercase={titleUppercase}
            />
          ))
        )}
      </div>
    </CollapsiblePanel>
  );
}

export default TitlesPanel;
