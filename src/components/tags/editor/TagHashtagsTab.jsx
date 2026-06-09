// src/components/tags/editor/TagHashtagsTab.jsx

import TagPhraseEditor from '../TagPhraseEditor';

export default function TagHashtagsTab({ tag, onUpdateTag }) {
  return (
    <TagPhraseEditor
      title="Hashtags"
      tagName={tag.name}
      field="hashtags"
      phrases={tag.hashtags || []}
      onUpdateTag={onUpdateTag}
    />
  );
}
