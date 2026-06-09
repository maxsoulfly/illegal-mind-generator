import { useState } from 'react';

import TagEditorTabs from './editor/TagEditorTabs';
import TagBasicsTab from './editor/TagBasicsTab';
import TagTitlesTab from './editor/TagTitlesTab';
import TagShortHooksTab from './editor/TagShortHooksTab';
import TagPhraseEditor from './TagPhraseEditor';

export default function TagEditor({
  tag,
  categories,
  onUpdateTag,
  onToggleVisibility,
  projectOverrides,
  resetTagOverride,
}) {
  const [activeTab, setActiveTab] = useState('basics');

  return (
    <details className="tag-section">
      <summary>Edit tag</summary>

      <TagEditorTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === 'basics' && (
        <TagBasicsTab
          tag={tag}
          categories={categories}
          onUpdateTag={onUpdateTag}
          onToggleVisibility={onToggleVisibility}
          projectOverrides={projectOverrides}
          resetTagOverride={resetTagOverride}
        />
      )}

      {activeTab === 'titles' && (
        <TagTitlesTab tag={tag} onUpdateTag={onUpdateTag} />
      )}

      {activeTab === 'descriptions' && (
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
      )}

      {activeTab === 'shortHooks' && (
        <TagShortHooksTab tag={tag} onUpdateTag={onUpdateTag} />
      )}

      {activeTab === 'hashtags' && (
        <TagPhraseEditor
          title="Hashtags"
          tagName={tag.name}
          field="hashtags"
          phrases={tag.hashtags || []}
          onUpdateTag={onUpdateTag}
        />
      )}
    </details>
  );
}
