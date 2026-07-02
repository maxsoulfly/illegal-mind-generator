// src/components/tags/editor/TagTitlesTab.jsx

import TagPhraseEditor from '../TagPhraseEditor';

export default function TagTitlesTab({ tag, onUpdateTag, sourceTarget }) {
  return (
    <>
      <TagPhraseEditor
        title="Long title phrases"
        tagName={tag.name}
        field="title"
        phrases={tag.maps.title}
        onUpdateTag={onUpdateTag}
        autoOpen={sourceTarget?.field === 'title'}
        highlightText={sourceTarget?.field === 'title' ? sourceTarget.phraseText : null}
      />

      <TagPhraseEditor
        title="Thumbnail phrases"
        tagName={tag.name}
        field="thumbnail"
        phrases={tag.maps.thumbnail}
        onUpdateTag={onUpdateTag}
        autoOpen={sourceTarget?.field === 'thumbnail'}
        highlightText={sourceTarget?.field === 'thumbnail' ? sourceTarget.phraseText : null}
      />
    </>
  );
}
