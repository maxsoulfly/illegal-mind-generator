import CopyButton from '../CopyButton';
import ToggleButton from '../ToggleButton';

function TitlesPanel({ titles, thumbnails, panelVisibility, togglePanel }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Titles</h2>
      </div>

      <ToggleButton
        isOpen={panelVisibility.titles}
        onClick={() => togglePanel('titles')}
        label="Titles"
      />
      {panelVisibility.titles && (
        <div>
          {titles.map((title, index) => {
            const thumbnail = thumbnails[index] ?? '';
            return (
              <div key={index} className="generated-pair terminal-block">
                <div className="generated-pair-row">
                  <p className="generated-pair-text">
                    <strong className="saved-entry-signal">Title:</strong>{' '}
                    {title}
                  </p>

                  <CopyButton text={title} />
                </div>

                <div className="generated-pair-row">
                  <p className="generated-pair-text">
                    <strong className="saved-entry-signal">Thumb:</strong>{' '}
                    {thumbnail}
                  </p>

                  <CopyButton text={thumbnail} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TitlesPanel;
