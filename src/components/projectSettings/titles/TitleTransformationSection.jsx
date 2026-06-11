export default function TitleTransformationSection({
  listSeparator,
  connector,
  maxPhrases,
  onUpdate,
}) {
  return (
    <details className="tag-editor-section">
      <summary className="tag-category">Transformation</summary>

      <div className="tag-phrase-row">
        <label className="form-label">List separator</label>
        <input
          className="form-input"
          value={listSeparator}
          onChange={(e) => onUpdate('listSeparator', e.target.value)}
        />
      </div>

      <div className="tag-phrase-row">
        <label className="form-label">Connector</label>
        <input
          className="form-input"
          value={connector}
          onChange={(e) => onUpdate('connector', e.target.value)}
        />
      </div>

      <div className="tag-phrase-row">
        <label className="form-label">Max phrases</label>
        <input
          type="range"
          min={1}
          max={4}
          value={maxPhrases}
          onChange={(e) => onUpdate('maxTransformationPhrases', Number(e.target.value))}
        />
        <span className="tag-status">{maxPhrases}</span>
      </div>
    </details>
  );
}
