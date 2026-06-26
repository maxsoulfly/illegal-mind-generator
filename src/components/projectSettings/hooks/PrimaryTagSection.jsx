import LabelSelectRow from '../../ui/LabelSelectRow';
import LabelInputRow from '../../ui/LabelInputRow';
import LabelSliderRow from '../../ui/LabelSliderRow';

// Mirrors TitleTransformationSection — same details/summary/LabelInputRow pattern.
// Configures how {primaryTag} is resolved: order (first N or random N),
// count (how many tags), and separator (string joining multiple tags).
export default function PrimaryTagSection({ config = {}, onUpdate }) {
  const order = config.order ?? 'selection';
  const count = config.count ?? 1;
  const separator = config.separator ?? ' & ';

  return (
    <details className="tag-editor-section">
      <summary className="tag-category">{'{primaryTag}'}</summary>

      <LabelSelectRow
        label="Order"
        value={order}
        onChange={(val) => onUpdate('order', val)}
        options={[
          { value: 'selection', label: 'First N' },
          { value: 'random', label: 'Random N' },
        ]}
        compact
      />

      <LabelSliderRow
        label="Count"
        value={count}
        min={1}
        max={10}
        onChange={(val) => onUpdate('count', val)}
      />

      <LabelInputRow
        label="Separator"
        value={separator}
        onChange={(val) => onUpdate('separator', val)}
        compact
      />
    </details>
  );
}
