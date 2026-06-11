import LabelInputRow from '../../ui/LabelInputRow';

export default function TitleTransformationSection({
  listSeparator,
  connector,
  maxPhrases,
  onUpdate,
}) {
  return (
    <details className="tag-editor-section">
      <summary className="tag-category">Transformation</summary>

      <LabelInputRow
        label="Separator"
        value={listSeparator}
        onChange={(val) => onUpdate('listSeparator', val)}
        compact
      />

      <LabelInputRow
        label="Connector"
        value={connector}
        onChange={(val) => onUpdate('connector', val)}
        compact
      />

      <div className="tag-phrase-row">
        <label className="form-label">Max phrases</label>
        <input
          type="range"
          min={1}
          max={4}
          value={maxPhrases}
          onChange={(e) =>
            onUpdate('maxTransformationPhrases', Number(e.target.value))
          }
        />
        <span className="tag-status">{maxPhrases}</span>
      </div>
    </details>
  );
}
