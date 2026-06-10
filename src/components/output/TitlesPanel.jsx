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
}) {
  const mixedShortTitles = buildMixedShortTitles(shortHooks);
  return (
    <div className={`panel ${panelVisibility.titles ? '' : 'panel-collapsed'}`}>
      <div className="panel-header">
        <h2 className="panel-title">Titles</h2>
        <ToggleButton
          isOpen={panelVisibility.titles}
          onClick={() => togglePanel('titles')}
          label="Titles"
          compact
        />
      </div>

      {panelVisibility.titles && (
        <div>
          {videoType === 'Shorts' ? (
            <ShortHookTitles
              title="Best Shorts Title Candidates"
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
