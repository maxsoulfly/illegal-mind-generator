import LabelInputRow from '../../ui/LabelInputRow';
import LabelSliderRow from '../../ui/LabelSliderRow';

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

      <LabelSliderRow
        label="Max phrases"
        value={maxPhrases}
        min={1}
        max={4}
        onChange={(val) => onUpdate('maxTransformationPhrases', val)}
      />
    </details>
  );
}
