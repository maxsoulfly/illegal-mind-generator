import { useState } from 'react';

import TagBasicsTab from './editor/TagBasicsTab';
import TagFieldTab from './editor/TagFieldTab';
import TagContentOverview from './editor/TagContentOverview';
import TagDrillHeader from './editor/TagDrillHeader';
import TagPhraseEditor from './TagPhraseEditor';
import {
  TAG_CONTENT_SECTIONS,
  getInitialView,
  parentOf,
  resolvePoolEditorProps,
  pickTagPhrasePlaceholders,
} from '../../utils/tagContentSections';
import { isSourceMatch } from '../../utils/tagFieldTabs';

const SECTION_LABEL = Object.fromEntries(
  TAG_CONTENT_SECTIONS.map((section) => [section.id, section.label]),
);

// Stage 1: Descriptions and Short Hooks still render through the old
// TagFieldTab (multi-pool). Their dedicated drill screens land in Stages
// 2-3; until then any description-/shortHook-level view routes to the legacy
// tab and "back" collapses straight to the overview.
const isLegacyDescriptionView = (view) =>
  view?.level === 'descriptionGroups' || view?.level === 'descriptionPool';
const isLegacyShortHookView = (view) =>
  view?.level === 'shortHookCategories' || view?.level === 'shortHookPool';

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
  otherProjects,
  onCopyTagFromProject,
}) {
  // null until the user navigates inside the card; a click-to-navigate
  // target still drives the initial view via getInitialView.
  const [manualView, setManualView] = useState(null);
  const view = manualView ?? getInitialView(tag, sourceTarget);

  const goBack = () => {
    if (isLegacyDescriptionView(view) || isLegacyShortHookView(view)) {
      setManualView({ level: 'overview' });
      return;
    }
    setManualView(parentOf(view) || { level: 'overview' });
  };

  const openSection = (section) => {
    if (section.kind === 'pool') {
      setManualView({ level: 'pool', field: section.id });
    } else if (section.id === 'descriptions') {
      setManualView({ level: 'descriptionGroups' });
    } else if (section.id === 'shortHooks') {
      setManualView({ level: 'shortHookCategories' });
    }
  };

  const renderScreen = () => {
    if (view.level === 'basics') {
      return (
        <>
          <TagDrillHeader label={tag.label} title="Basics" onBack={goBack} />
          <TagBasicsTab
            tag={tag}
            categories={categories}
            onUpdateTag={onUpdateTag}
            onToggleVisibility={onToggleVisibility}
            onDuplicateTag={onDuplicateTag}
            projectOverrides={projectOverrides}
            resetTagOverride={resetTagOverride}
            otherProjects={otherProjects}
            onCopyTagFromProject={onCopyTagFromProject}
          />
        </>
      );
    }

    if (view.level === 'pool') {
      const { field, phrases } = resolvePoolEditorProps(tag, view);
      const matched =
        sourceTarget?.tagName === tag.name && isSourceMatch(sourceTarget, { field });
      return (
        <>
          <TagDrillHeader
            label={tag.label}
            title={SECTION_LABEL[view.field]}
            subtitle={`${phrases.length} ${phrases.length === 1 ? 'phrase' : 'phrases'}`}
            onBack={goBack}
          />
          <TagPhraseEditor
            noWrapper
            tagName={tag.name}
            field={field}
            phrases={phrases}
            placeholders={pickTagPhrasePlaceholders(view.field, projectConfig)}
            onUpdateTag={onUpdateTag}
            highlightText={matched ? sourceTarget.phraseText ?? sourceTarget.hookText : null}
          />
        </>
      );
    }

    if (isLegacyDescriptionView(view)) {
      return (
        <>
          <TagDrillHeader label={tag.label} title="Descriptions" onBack={goBack} />
          <TagFieldTab
            tabId="descriptions"
            tag={tag}
            onUpdateTag={onUpdateTag}
            sourceTarget={sourceTarget}
          />
        </>
      );
    }

    if (isLegacyShortHookView(view)) {
      return (
        <>
          <TagDrillHeader label={tag.label} title="Short Hooks" onBack={goBack} />
          <TagFieldTab
            tabId="shortHooks"
            tag={tag}
            onUpdateTag={onUpdateTag}
            sourceTarget={sourceTarget}
            searchable
            projectConfig={projectConfig}
          />
        </>
      );
    }

    return (
      <TagContentOverview
        tag={tag}
        onOpenSection={openSection}
        onEditBasics={() => setManualView({ level: 'basics' })}
      />
    );
  };

  return (
    <details className="tag-section" open={shouldOpenEditor(tag, sourceTarget)}>
      <summary>Edit tag</summary>
      {renderScreen()}
    </details>
  );
}
