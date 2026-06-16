import ToggleInputRow from '../../ui/ToggleInputRow';

export default function TitlePrefixSuffixSection({
  prefix,
  prefixEnabled,
  longSuffix,
  longSuffixEnabled,
  shortsPrefix,
  shortsPrefixEnabled,
  shortsSuffix,
  shortsSuffixEnabled,
  onUpdate,
}) {
  return (
    <details className="tag-editor-section">
      <summary className="tag-category">Prefix / Suffix</summary>

      <p className="tag-category">Long Titles</p>

      <ToggleInputRow
        id="long-prefix-enabled"
        label="Prefix"
        checked={prefixEnabled}
        onToggle={(val) => onUpdate('prefixEnabled', val)}
        value={prefix}
        onChange={(val) => onUpdate('prefix', val)}
        placeholder="{num} available"
        placeholders={['{num}']}
      />

      <ToggleInputRow
        id="long-suffix-enabled"
        label="Suffix"
        checked={longSuffixEnabled}
        onToggle={(val) => onUpdate('longSuffixEnabled', val)}
        value={longSuffix}
        onChange={(val) => onUpdate('longSuffix', val)}
        placeholder="e.g. // Illegal Mind Rework"
        placeholders={['{num}']}
      />

      <p className="tag-category">Shorts Titles</p>

      <ToggleInputRow
        id="shorts-prefix-enabled"
        label="Prefix"
        checked={shortsPrefixEnabled}
        onToggle={(val) => onUpdate('shortsPrefixEnabled', val)}
        value={shortsPrefix}
        onChange={(val) => onUpdate('shortsPrefix', val)}
        placeholder="{num} available"
        placeholders={['{num}']}
      />

      <ToggleInputRow
        id="shorts-suffix-enabled"
        label="Suffix"
        checked={shortsSuffixEnabled}
        onToggle={(val) => onUpdate('shortsSuffixEnabled', val)}
        value={shortsSuffix}
        onChange={(val) => onUpdate('shortsSuffix', val)}
        placeholder="{num} available"
        placeholders={['{num}']}
      />
    </details>
  );
}
