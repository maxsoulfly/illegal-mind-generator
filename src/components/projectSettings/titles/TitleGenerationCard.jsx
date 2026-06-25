import TitlePrefixSuffixSection from './TitlePrefixSuffixSection';
import TitleTransformationSection from './TitleTransformationSection';
import LabelSliderRow from '../../ui/LabelSliderRow';

// Card for title generation settings: hook mixing, prefix/suffix, transformation.
// Follows the same visual structure as ShortHookCard (tag-card / tag-card-header).
export default function TitleGenerationCard({ titleConfig, onUpdate, onReset }) {
  const t = titleConfig;

  const prefix = t.prefix ?? t.longPrefix ?? '';
  const longSuffix = t.longSuffix ?? '';
  const shortsPrefix = t.shortsPrefix ?? '';
  const shortsSuffix = t.shortsSuffix ?? '';

  const prefixEnabled = t.prefixEnabled !== false;
  const longSuffixEnabled = t.longSuffixEnabled !== false;
  const shortsPrefixEnabled = t.shortsPrefixEnabled !== false;
  const shortsSuffixEnabled = t.shortsSuffixEnabled !== false;

  const connector = t.connector ?? '&';
  const listSeparator = t.listSeparator ?? ', ';
  const maxPhrases = t.maxTransformationPhrases ?? 1;
  const count = t.count ?? 5;

  return (
    <article className="tag-card">
      <header className="tag-card-header">
        <h3>Generation</h3>

        <button
          type="button"
          className="tag-reset-button"
          title="Reset generation settings to defaults"
          onClick={onReset}
        >
          ↺
        </button>
      </header>

      <LabelSliderRow
        label="Titles to generate"
        value={count}
        min={1}
        max={10}
        onChange={(val) => onUpdate('count', val)}
      />

      <TitlePrefixSuffixSection
        prefix={prefix}
        prefixEnabled={prefixEnabled}
        longSuffix={longSuffix}
        longSuffixEnabled={longSuffixEnabled}
        shortsPrefix={shortsPrefix}
        shortsPrefixEnabled={shortsPrefixEnabled}
        shortsSuffix={shortsSuffix}
        shortsSuffixEnabled={shortsSuffixEnabled}
        onUpdate={onUpdate}
      />

      <TitleTransformationSection
        listSeparator={listSeparator}
        connector={connector}
        maxPhrases={maxPhrases}
        onUpdate={onUpdate}
      />
    </article>
  );
}
