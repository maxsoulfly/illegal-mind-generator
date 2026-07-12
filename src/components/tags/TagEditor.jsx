import { useState } from 'react';

import TagEditorTabs from './editor/TagEditorTabs';
import TagBasicsTab from './editor/TagBasicsTab';
import TagFieldTab from './editor/TagFieldTab';

function getInitialTab(tag, sourceTarget) {
  if (sourceTarget?.tagName !== tag.name) return 'basics';

  if (sourceTarget.hookText || sourceTarget.hookType) {
    return 'shortHooks';
  }

  if (sourceTarget.field === 'thumbnail' || sourceTarget.field === 'title') {
    return 'titles';
  }

  return 'basics';
}

function shouldOpenEditor(tag, sourceTarget) {
  return sourceTarget?.tagName === tag.name;
}
export default function TagEditor({
  tag,
  categories,
  onUpdateTag,
  onToggleVisibility,
  onDuplicateTag,
  projectOverrides,
  resetTagOverride,
  sourceTarget,
  projectConfig,
}) {
  const [activeTab, setActiveTab] = useState(() =>
    getInitialTab(tag, sourceTarget),
  );
  return (
    <details className="tag-section" open={shouldOpenEditor(tag, sourceTarget)}>
      <summary>Edit tag</summary>

      <TagEditorTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === 'basics' && (
        <TagBasicsTab
          tag={tag}
          categories={categories}
          onUpdateTag={onUpdateTag}
          onToggleVisibility={onToggleVisibility}
          onDuplicateTag={onDuplicateTag}
          projectOverrides={projectOverrides}
          resetTagOverride={resetTagOverride}
        />
      )}

      {activeTab === 'titles' && (
        <TagFieldTab tabId="titles" tag={tag} onUpdateTag={onUpdateTag} sourceTarget={sourceTarget} />
      )}

      {activeTab === 'descriptions' && (
        <TagFieldTab tabId="descriptions" tag={tag} onUpdateTag={onUpdateTag} sourceTarget={sourceTarget} />
      )}

      {activeTab === 'shortHooks' && (
        <TagFieldTab
          tabId="shortHooks"
          tag={tag}
          onUpdateTag={onUpdateTag}
          sourceTarget={sourceTarget}
          searchable
          projectConfig={projectConfig}
        />
      )}

      {activeTab === 'hashtags' && (
        <TagFieldTab tabId="hashtags" tag={tag} onUpdateTag={onUpdateTag} sourceTarget={sourceTarget} />
      )}
    </details>
  );
}
