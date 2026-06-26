import ToggleButton from '../ui/ToggleButton';
import ShortHookTitles from './ShortHookTitles';
import GeneratedTitlePair from './GeneratedTitlePair';
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
    <div className={`panel ${panelVisibility.titles ? '' : 'panel-collapsed'}`}>
      <div className="panel-header">
        {onNavigateToSettings ? (
          <button type="button" className="panel-title panel-title--nav" onClick={() => onNavigateToSettings('titles')}>Titles</button>
        ) : (
          <h2 className="panel-title">Titles</h2>
        )}

        {/* Only show the hooks toggle for long video mode — Shorts already use hooks directly. */}
        {!isShorts && (
          <button
            type="button"
            className="button-secondary"
            title="Mix shorts hooks into long title candidates"
            onClick={onToggleHooksForLongTitles}
          >
            {useHooksForLongTitles ? 'Hooks: ON' : 'Hooks: OFF'}
          </button>
        )}

        <ToggleButton
          isOpen={panelVisibility.titles}
          onClick={() => togglePanel('titles')}
          label="Titles"
          compact
        />
      </div>

      {panelVisibility.titles && (
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
      )}
    </div>
  );
}

export default TitlesPanel;
