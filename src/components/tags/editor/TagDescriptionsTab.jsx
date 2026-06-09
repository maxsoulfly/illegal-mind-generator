// src/components/tags/editor/TagDescriptionsTab.jsx

import TagPhraseEditor from '../TagPhraseEditor';

export default function TagDescriptionsTab({ tag, onUpdateTag }) {
  return (
    <div className="tag-editor-nested-section">
      <TagPhraseEditor
        title="Technical phrases"
        tagName={tag.name}
        parentField="description"
        parentValue={tag.maps.description}
        field="technical"
        phrases={tag.maps.description?.technical}
        onUpdateTag={onUpdateTag}
      />

      <TagPhraseEditor
        title="Log phrases"
        tagName={tag.name}
        parentField="description"
        parentValue={tag.maps.description}
        field="log"
        phrases={tag.maps.description?.log}
        onUpdateTag={onUpdateTag}
      />

      <TagPhraseEditor
        title="Status phrases"
        tagName={tag.name}
        parentField="description"
        parentValue={tag.maps.description}
        field="status"
        phrases={tag.maps.description?.status}
        onUpdateTag={onUpdateTag}
      />
    </div>
  );
}
