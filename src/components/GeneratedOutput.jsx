import CopyButton from './CopyButton';
function GeneratedOutput({
  titles,
  thumbnails,
  descriptions,
  hashtags,
  youtubeTags,
  hybridPrompt,
  longDescription,
  videoType,
  panelVisibility,
  setPanelVisibility,
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

          <button
            className="button-primary"
            onClick={() => togglePanel('titles')}
          >
            {panelVisibility.titles ? 'Hide' : 'Show'}
          </button>
        </div>
        {panelVisibility.titles && (
          // existing Titles content here
          <div>
            {titles.map((title, index) => {
              const thumbnail = thumbnails[index] ?? '';
              const onCopy = (text) => {
                navigator.clipboard.writeText(text);
              };
              return (
                <div key={index} className="generated-pair terminal-block">
                  <div className="generated-pair-row">
                    <p className="generated-pair-text">
                      <strong className="saved-entry-signal">Title:</strong>{' '}
                      {title}
                    </p>

                    <button
                      type="button"
                      className="copy-button"
                      onClick={() => onCopy(title)}
                    >
                      Copy Title
                    </button>
                  </div>

                  <div className="generated-pair-row">
                    <p className="generated-pair-text">
                      <strong className="saved-entry-signal">Thumb:</strong>{' '}
                      {thumbnail}
                    </p>

                    <button
                      type="button"
                      className="copy-button"
                      onClick={() => onCopy(thumbnail)}
                    >
                      Copy Thumb
                    </button>
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

          <button
            className="button-primary"
            onClick={() => togglePanel('desriptions')}
          >
            {panelVisibility.desriptions ? 'Hide' : 'Show'}
          </button>
        </div>
        {panelVisibility.desriptions && (
          <div>
            {/* LONG */}
            {videoType === 'Long' && (
              <div className="output-item terminal-block">
                <p style={{ whiteSpace: 'pre-line' }}>{longDescription}</p>
                <CopyButton text={longDescription} />
              </div>
            )}

            {/* SHORTS */}
            {videoType === 'Shorts' &&
              descriptions.map((description, index) => (
                <div key={index} className="output-item terminal-block">
                  <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
                  <CopyButton text={description} />
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Hashtags</h2>

          <button
            className="button-primary"
            onClick={() => togglePanel('hashtags')}
          >
            {panelVisibility.hashtags ? 'Hide' : 'Show'}
          </button>
        </div>

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

          <button
            className="button-primary"
            onClick={() => togglePanel('youtubeTags')}
          >
            {panelVisibility.youtubeTags ? 'Hide' : 'Show'}
          </button>
        </div>

        {panelVisibility.youtubeTags && (
          <div className="output-item terminal-block">
            <p className="output-text">{youtubeTags}</p>
            <CopyButton text={youtubeTags} />
          </div>
        )}
      </div>

      <div className="panel">
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
      </div>
    </div>
  );
}

export default GeneratedOutput;
