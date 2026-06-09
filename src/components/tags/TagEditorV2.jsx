import { useState } from 'react';

import TagEditorTabs from './editor/TagEditorTabs';
import TagBasicsTab from './editor/TagBasicsTab';
import TagTitlesTab from './editor/TagTitlesTab';
import TagDescriptionsTab from './editor/TagDescriptionsTab';
import TagShortHooksTab from './editor/TagShortHooksTab';
import TagHashtagsTab from './editor/TagHashtagsTab';
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
        <TagDescriptionsTab tag={tag} onUpdateTag={onUpdateTag} />
      )}

      {activeTab === 'shortHooks' && (
        <TagShortHooksTab tag={tag} onUpdateTag={onUpdateTag} />
      )}

      {activeTab === 'hashtags' && (
        <TagHashtagsTab tag={tag} onUpdateTag={onUpdateTag} />
      )}
    </details>
  );
}
