import { useMemo, useState } from 'react';

import TagPhraseEditor from '../TagPhraseEditor';
import { buildHookPlaceholders } from '../../../utils/hookPlaceholders';

const HOOK_TYPES = [
  'nostalgia',
  'emotion',
  'transformation',
  'discussion',
  'musician',
  'progress',
];

function formatHookTitle(hookType) {
  return `${hookType.charAt(0).toUpperCase()}${hookType.slice(1)}`;
}

function getMatchingPhrases(hookType, phrases, search) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) return phrases;

  const titleMatches = hookType.toLowerCase().includes(normalizedSearch);

  if (titleMatches) return phrases;

  return phrases.filter((phrase) =>
    phrase.toLowerCase().includes(normalizedSearch),
  );
}

export default function TagShortHooksTab({ tag, onUpdateTag, sourceTarget, projectConfig }) {
  const [search, setSearch] = useState('');
  const placeholders = buildHookPlaceholders(projectConfig);

  const visibleHookTypes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return HOOK_TYPES.map((hookType) => ({
        hookType,
        phrases: tag.maps.shortHooks?.[hookType] || [],
      }));
    }

    return HOOK_TYPES.map((hookType) => {
      const phrases = tag.maps.shortHooks?.[hookType] || [];
      const matchingPhrases = getMatchingPhrases(hookType, phrases, search);

      return {
        hookType,
        phrases: matchingPhrases,
      };
    }).filter((hookGroup) => hookGroup.phrases.length > 0);
  }, [tag.maps.shortHooks, search]);

  return (
    <div className="tag-editor-nested-section">
      <input
        className="form-input"
        type="search"
        placeholder="Search hooks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {visibleHookTypes.map(({ hookType, phrases }) => (
        <TagPhraseEditor
          key={hookType}
          title={formatHookTitle(hookType)}
          tagName={tag.name}
          parentField="shortHooks"
          parentValue={tag.maps.shortHooks || {}}
          field={hookType}
          phrases={phrases}
          placeholders={placeholders}
          onUpdateTag={onUpdateTag}
          autoOpen={sourceTarget?.hookType === hookType}
          highlightText={sourceTarget?.hookType === hookType ? sourceTarget.hookText : null}
        />
      ))}

      {visibleHookTypes.length === 0 && (
        <p className="tag-show-more">No hooks found.</p>
      )}
    </div>
  );
}
