// src/components/tags/editor/TagTitlesTab.jsx

import TagPhraseEditor from '../TagPhraseEditor';

export default function TagTitlesTab({ tag, onUpdateTag }) {
  return (
    <>
      <TagPhraseEditor
        title="Long title phrases"
        tagName={tag.name}
        field="title"
        phrases={tag.maps.title}
        onUpdateTag={onUpdateTag}
      />

      <TagPhraseEditor
        title="Thumbnail phrases"
        tagName={tag.name}
        field="thumbnail"
        phrases={tag.maps.thumbnail}
        onUpdateTag={onUpdateTag}
      />
    </>
  );
}
