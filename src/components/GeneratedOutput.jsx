import CopyButton from './CopyButton';
import ToggleButton from './ToggleButton';

function GeneratedOutput({
  titles,
  thumbnails,
  descriptions,
  hashtags,
  youtubeTags,
  longDescription,
  videoType,
  panelVisibility,
  setPanelVisibility,
  fileId,
}) {
  const togglePanel = (key) => {
    setPanelVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  return (
    <div className="output-stack">
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
          // existing Titles content here
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

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Descriptions</h2>
        </div>
        <ToggleButton
          isOpen={panelVisibility.desriptions}
          onClick={() => togglePanel('desriptions')}
          label="Desriptions"
        />

        {panelVisibility.desriptions && (
          <div>
            {/* LONG */}
            {videoType === 'Long' && (
              <div className="output-item terminal-block">
                <p style={{ whiteSpace: 'pre-line' }}>{longDescription}</p>
                <CopyButton
                  text={`${longDescription}\n\n/// FILE ${fileId}: ${hashtags}`}
                />
              </div>
            )}

            {/* SHORTS */}
            {videoType === 'Shorts' &&
              descriptions.map((description, index) => (
                <div key={index} className="output-item terminal-block">
                  <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
                  <CopyButton
                    text={`${description}\n\n/// FILE ${fileId}: ${hashtags}`}
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Hashtags</h2>
        </div>
        <ToggleButton
          isOpen={panelVisibility.hashtags}
          onClick={() => togglePanel('hashtags')}
          label="Hashtags"
        />

        {panelVisibility.hashtags && (
          <div className="output-item terminal-block">
            <p className="output-text">{hashtags}</p>
            <CopyButton text={hashtags} />
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">YouTube Tags</h2>
        </div>
        <ToggleButton
          isOpen={panelVisibility.youtubeTags}
          onClick={() => togglePanel('youtubeTags')}
          label="YouTube Tags"
        />

        {panelVisibility.youtubeTags && (
          <div className="output-item terminal-block">
            <p className="output-text">{youtubeTags}</p>
            <CopyButton text={youtubeTags} />
          </div>
        )}
      </div>

      {/* <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Hybrid Prompt</h2>

          <button
            className="button-primary"
            onClick={() => togglePanel('hybrid')}
          >
            {panelVisibility.hybrid ? 'Hide' : 'Show'}
          </button>
        </div>
        {panelVisibility.hybrid && (
          <div className="output-item terminal-block">
            <pre className="prompt-block">{hybridPrompt}</pre>
            <CopyButton text={hybridPrompt} />
          </div>
        )}
      </div> */}
    </div>
  );
}

export default GeneratedOutput;
