import { useMemo, useState } from 'react';

import TagPhraseEditor from '../TagPhraseEditor';

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

function hookTypeMatchesSearch(hookType, phrases, search) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) return true;

  const titleMatches = hookType.toLowerCase().includes(normalizedSearch);
  const phraseMatches = phrases.some((phrase) =>
    phrase.toLowerCase().includes(normalizedSearch),
  );

  return titleMatches || phraseMatches;
}

export default function TagShortHooksTab({ tag, onUpdateTag }) {
  const [search, setSearch] = useState('');

  const visibleHookTypes = useMemo(
    () =>
      HOOK_TYPES.filter((hookType) =>
        hookTypeMatchesSearch(
          hookType,
          tag.maps.shortHooks?.[hookType] || [],
          search,
        ),
      ),
    [tag.maps.shortHooks, search],
  );

  return (
    <div className="tag-editor-nested-section">
      <input
        className="form-input"
        type="search"
        placeholder="Search hooks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {visibleHookTypes.map((hookType) => (
        <TagPhraseEditor
          key={hookType}
          title={formatHookTitle(hookType)}
          tagName={tag.name}
          parentField="shortHooks"
          parentValue={tag.maps.shortHooks || {}}
          field={hookType}
          phrases={tag.maps.shortHooks?.[hookType] || []}
          onUpdateTag={onUpdateTag}
        />
      ))}

      {visibleHookTypes.length === 0 && (
        <p className="tag-show-more">No hooks found.</p>
      )}
    </div>
  );
}
