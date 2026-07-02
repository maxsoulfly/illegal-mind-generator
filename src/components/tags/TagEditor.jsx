import { useState } from 'react';

import TagEditorTabs from './editor/TagEditorTabs';
import TagBasicsTab from './editor/TagBasicsTab';
import TagTitlesTab from './editor/TagTitlesTab';
import TagDescriptionsTab from './editor/TagDescriptionsTab';
import TagShortHooksTab from './editor/TagShortHooksTab';
import TagHashtagsTab from './editor/TagHashtagsTab';

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
        <TagTitlesTab tag={tag} onUpdateTag={onUpdateTag} sourceTarget={sourceTarget} />
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
