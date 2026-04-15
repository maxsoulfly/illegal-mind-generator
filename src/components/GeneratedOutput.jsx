import CopyButton from './CopyButton';
function GeneratedOutput({
  titles,
  thumbnails,
  descriptions,
  hashtags,
  hybridPrompt,
}) {
  return (
    <div className="output-stack">
      <div className="panel">
        <h2 className="panel-title">Generated Output</h2>

        {titles.map((title, index) => {
          const pairText = `Title: ${title}\nThumbnail: ${thumbnails[index]}`;

          return (
            <div key={index} className="output-item terminal-block">
              <p>
                <strong>Title:</strong> {title}
              </p>
              <p>
                <strong>Thumbnail:</strong> {thumbnails[index]}
              </p>
              <CopyButton text={pairText} />
            </div>
          );
        })}
      </div>

      <div className="panel">
        <h2 className="panel-title">Descriptions</h2>

        {descriptions.map((description, index) => (
          <div key={index} className="output-item terminal-block">
            <p>{description}</p>
            <CopyButton text={description} />
          </div>
        ))}
      </div>

      <div className="panel">
        <h2 className="panel-title">Hashtags</h2>

        <div className="output-item terminal-block">
          <p className="output-text">{hashtags}</p>
          <CopyButton text={hashtags} />
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Hybrid Prompt</h2>

        <div className="output-item terminal-block">
          <pre className="prompt-block">{hybridPrompt}</pre>
          <CopyButton text={hybridPrompt} />
        </div>
      </div>
    </div>
  );
}

export default GeneratedOutput;
