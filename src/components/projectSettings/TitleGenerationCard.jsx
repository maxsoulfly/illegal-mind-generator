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
  const useHooksForLongTitles = t.useHooksForLongTitles ?? false;

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

      <div className="tag-phrase-row">
        <input
          type="checkbox"
          id="useHooksForLongTitles"
          checked={useHooksForLongTitles}
          onChange={(e) => onUpdate('useHooksForLongTitles', e.target.checked)}
        />
        <label className="form-label" htmlFor="useHooksForLongTitles">
          Mix shorts hooks into long titles by default
        </label>
      </div>

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
    </article>
  );
}
