import ToggleButton from '../ui/ToggleButton';
import ShortHookTitles from './ShortHookTitles';
import GeneratedTitlePair from './GeneratedTitlePair';

function TitlesPanel({
  titles,
  thumbnails,
  panelVisibility,
  togglePanel,
  shortHooks,
  videoType,
  onOpenSourceTag,
}) {
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
          {videoType === 'Shorts'
            ? shortHooks.map((group) => (
                <ShortHookTitles
                  key={group.type}
                  title={group.label}
                  hooks={group.hooks}
                  onOpenSourceTag={onOpenSourceTag}
                />
              ))
            : titles.map((title, index) => {
                const thumbnail = thumbnails[index] ?? '';

                return (
                  <GeneratedTitlePair
                    key={index}
                    title={title}
                    thumbnail={thumbnail}
                  />
                );
              })}
        </div>
      )}
    </div>
  );
}

export default TitlesPanel;
