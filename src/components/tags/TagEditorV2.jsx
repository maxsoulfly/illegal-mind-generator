import { useEffect, useState } from 'react';

import TagEditorTabs from './editor/TagEditorTabs';
import TagBasicsTab from './editor/TagBasicsTab';
import TagTitlesTab from './editor/TagTitlesTab';
import TagDescriptionsTab from './editor/TagDescriptionsTab';
import TagShortHooksTab from './editor/TagShortHooksTab';
import TagHashtagsTab from './editor/TagHashtagsTab';

export default function TagEditor({
  tag,
  categories,
  onUpdateTag,
  onToggleVisibility,
  projectOverrides,
  resetTagOverride,
  sourceTarget,
}) {
  const [activeTab, setActiveTab] = useState('basics');

  useEffect(() => {
    if (sourceTarget?.tagName !== tag.name) return;

    if (sourceTarget.hookText || sourceTarget.hookType) {
      setActiveTab('shortHooks');
    }
  }, [sourceTarget, tag.name]);
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
        <TagShortHooksTab
          tag={tag}
          onUpdateTag={onUpdateTag}
          sourceTarget={sourceTarget}
        />
      )}

      {activeTab === 'hashtags' && (
        <TagHashtagsTab tag={tag} onUpdateTag={onUpdateTag} />
      )}
    </details>
  );
}
