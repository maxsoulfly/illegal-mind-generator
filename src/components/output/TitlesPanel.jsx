import ShortHookTitles from './ShortHookTitles';
import GeneratedTitlePair from './GeneratedTitlePair';
import CollapsiblePanel from '../ui/CollapsiblePanel';
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildMixedShortTitles(shortHooks = [], limit = 5) {
  return shuffleArray(
    shortHooks.flatMap((group) =>
      group.hooks.map((hook) => ({
        ...hook,
        hookTypeLabel: group.label,
      })),
    ),
  ).slice(0, limit);
}
function TitlesPanel({
  titles,
  thumbnails,
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
}) {
  const mixedShortTitles = buildMixedShortTitles(shortHooks, titleCount ?? 5);
  const isShorts = videoType === 'Shorts';

  return (
    <CollapsiblePanel
      label="Titles"
      visible={panelVisibility.titles}
      onToggle={() => togglePanel('titles')}
      onNavigate={onNavigateToSettings ? () => onNavigateToSettings('titles') : undefined}
      headerExtra={
        /* Only show the hooks toggle for long video mode — Shorts already use hooks directly. */
        !isShorts && (
          <button
            type="button"
            className="button-secondary"
            title="Mix shorts hooks into long title candidates"
            onClick={onToggleHooksForLongTitles}
          >
            {useHooksForLongTitles ? 'Hooks: ON' : 'Hooks: OFF'}
          </button>
        )
      }
    >
      <div>
        {isShorts ? (
          <ShortHookTitles
            hooks={mixedShortTitles}
            onOpenSourceTag={onOpenSourceTag}
            onOpenSourceHook={onOpenSourceHook}
          />
        ) : (
          titles.map((title, index) => {
            const thumbnail = thumbnails[index] ?? '';

            return (
              <GeneratedTitlePair
                key={index}
                title={title}
                thumbnail={thumbnail}
                onOpenSourceTag={onOpenSourceTag}
                onOpenSourceHook={onOpenSourceHook}
                onOpenSourceTemplate={onOpenSourceTemplate}
              />
            );
          })
        )}
      </div>
    </CollapsiblePanel>
  );
}

export default TitlesPanel;
