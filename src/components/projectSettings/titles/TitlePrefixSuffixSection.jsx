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

      <div className="tag-phrase-row">
        <input
          type="checkbox"
          checked={prefixEnabled}
          onChange={(e) => onUpdate('prefixEnabled', e.target.checked)}
        />
        <label className="form-label">Prefix</label>
        <input
          className="form-input"
          value={prefix}
          disabled={!prefixEnabled}
          placeholder="{num} available"
          onChange={(e) => onUpdate('prefix', e.target.value)}
        />
      </div>

      <div className="tag-phrase-row">
        <input
          type="checkbox"
          checked={longSuffixEnabled}
          onChange={(e) => onUpdate('longSuffixEnabled', e.target.checked)}
        />
        <label className="form-label">Suffix</label>
        <input
          className="form-input"
          value={longSuffix}
          disabled={!longSuffixEnabled}
          placeholder="e.g. // Illegal Mind Rework"
          onChange={(e) => onUpdate('longSuffix', e.target.value)}
        />
      </div>

      <p className="tag-category">Shorts Titles</p>

      <div className="tag-phrase-row">
        <input
          type="checkbox"
          checked={shortsPrefixEnabled}
          onChange={(e) => onUpdate('shortsPrefixEnabled', e.target.checked)}
        />
        <label className="form-label">Prefix</label>
        <input
          className="form-input"
          value={shortsPrefix}
          disabled={!shortsPrefixEnabled}
          placeholder="{num} available"
          onChange={(e) => onUpdate('shortsPrefix', e.target.value)}
        />
      </div>

      <div className="tag-phrase-row">
        <input
          type="checkbox"
          checked={shortsSuffixEnabled}
          onChange={(e) => onUpdate('shortsSuffixEnabled', e.target.checked)}
        />
        <label className="form-label">Suffix</label>
        <input
          className="form-input"
          value={shortsSuffix}
          disabled={!shortsSuffixEnabled}
          placeholder="{num} available"
          onChange={(e) => onUpdate('shortsSuffix', e.target.value)}
        />
      </div>
    </details>
  );
}
