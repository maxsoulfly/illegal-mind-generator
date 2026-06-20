import ToggleButton from '../ui/ToggleButton';
import ShortHookTitles from './ShortHookTitles';
import GeneratedTitlePair from './GeneratedTitlePair';
const SHORTS_TITLE_LIMIT = 5;

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildMixedShortTitles(shortHooks = []) {
  return shuffleArray(
    shortHooks.flatMap((group) =>
      group.hooks.map((hook) => ({
        ...hook,
        hookTypeLabel: group.label,
      })),
    ),
  ).slice(0, SHORTS_TITLE_LIMIT);
}
function TitlesPanel({
  titles,
  thumbnails,
  panelVisibility,
  togglePanel,
  shortHooks,
  videoType,
  onOpenSourceTag,
  onOpenSourceHook,
  onOpenSourceTemplate,
  useHooksForLongTitles,
  onToggleHooksForLongTitles,
}) {
  const mixedShortTitles = buildMixedShortTitles(shortHooks);
  const isShorts = videoType === 'Shorts';

  return (
    <div className={`panel ${panelVisibility.titles ? '' : 'panel-collapsed'}`}>
      <div className="panel-header">
        <h2 className="panel-title">Titles</h2>

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
