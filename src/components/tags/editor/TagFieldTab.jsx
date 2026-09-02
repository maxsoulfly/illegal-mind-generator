import { useMemo, useState } from 'react';

import TagPhraseEditor from '../TagPhraseEditor';
import CopyPromptButton from '../../ui/CopyPromptButton';
import { TAG_FIELD_TABS, isSourceMatch } from '../../../utils/tagFieldTabs';
import { buildHookPlaceholders, LIVE_PLACEHOLDERS } from '../../../utils/hookPlaceholders';
import { buildTagShortHooksPrompt } from '../../../utils/authorPromptContexts';

function getEntryPhrases(tag, entry) {
  if (!entry.parentField) return tag.maps[entry.field] || [];
  return tag.maps[entry.parentField]?.[entry.field] || [];
}

// Generic body for the 5 phrase-based Tag Editor tabs (Titles/Thumbnails/
// Descriptions/Short Hooks/Hashtags) — renders one TagPhraseEditor per
// TAG_FIELD_TABS entry. Basics stays hand-written (TagBasicsTab.jsx) since
// it's discrete fixed fields, not a phrase list.
export default function TagFieldTab({
  tag,
  tabId,
  onUpdateTag,
  sourceTarget,
  searchable = false,
  projectConfig,
}) {
  const [search, setSearch] = useState('');
  const entries = useMemo(() => TAG_FIELD_TABS[tabId] || [], [tabId]);
  // Titles/Hashtags render with no wrapper; Descriptions/Short Hooks wrap in
  // .tag-editor-nested-section (a real left-border + indent, src/index.css)
  // — deriving this from whether any entry is nested preserves that split.
  const nested = entries.some((entry) => entry.parentField);
  // Titles only supports the live-safe token subset (see LIVE_PLACEHOLDERS)
  // -- tag title phrases resolve at plain render time with no pick-phase
  // freezing of their own (resolveTitleRecord.js), so a random token like
  // {originalGenre}/{tags.*} would re-roll on every keystroke instead of
  // staying frozen. Thumbnails and Short Hooks both have real freeze support
  // end-to-end (generateThumbnails.js/generateShortHooks.js), so they get
  // the full set.
  const placeholders =
    tabId === 'titles'
      ? LIVE_PLACEHOLDERS
      : tabId === 'thumbnails' || searchable
        ? buildHookPlaceholders(projectConfig)
        : undefined;

  const visibleEntries = useMemo(() => {
    const normalizedSearch = searchable ? search.trim().toLowerCase() : '';

    return entries
      .map((entry) => {
        const allPhrases = getEntryPhrases(tag, entry);
        if (!normalizedSearch) return { entry, phrases: allPhrases };

        const titleMatches = entry.field.toLowerCase().includes(normalizedSearch);
        const phrases = titleMatches
          ? allPhrases
          : allPhrases.filter((phrase) => phrase.toLowerCase().includes(normalizedSearch));
        return { entry, phrases };
      })
      .filter(({ phrases }) => !normalizedSearch || phrases.length > 0);
  }, [entries, tag, search, searchable]);

  const body = (
    <>
      {searchable && (
        <input
          className="form-input"
          type="search"
          placeholder="Search hooks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {visibleEntries.map(({ entry, phrases }) => {
        const matched = isSourceMatch(sourceTarget, entry);
        return (
          <TagPhraseEditor
            key={entry.field}
            title={entry.title}
            tagName={tag.name}
            parentField={entry.parentField}
            parentValue={entry.parentField ? tag.maps[entry.parentField] || {} : undefined}
            field={entry.field}
            phrases={phrases}
            placeholders={placeholders}
            onUpdateTag={onUpdateTag}
            autoOpen={matched}
            highlightText={matched ? sourceTarget.phraseText ?? sourceTarget.hookText : null}
            actionsSlot={
              tabId === 'shortHooks' ? (
                <CopyPromptButton
                  getPrompt={() =>
                    buildTagShortHooksPrompt(projectConfig, {
                      tag,
                      hookCategoryKey: entry.field,
                      hookCategoryLabel: entry.title,
                      // full list for this category, not the search-filtered subset
                      phrases: getEntryPhrases(tag, entry),
                    })
                  }
                />
              ) : undefined
            }
          />
        );
      })}

      {searchable && visibleEntries.length === 0 && (
        <p className="tag-show-more">No hooks found.</p>
      )}
    </>
  );

  return nested ? <div className="tag-editor-nested-section">{body}</div> : body;
}
