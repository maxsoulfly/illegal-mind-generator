import { useState } from 'react';

import TagBasicsTab from './editor/TagBasicsTab';
import TagFieldTab from './editor/TagFieldTab';
import TagContentOverview from './editor/TagContentOverview';
import TagDrillHeader from './editor/TagDrillHeader';
import TagShortHookCategoryList from './editor/TagShortHookCategoryList';
import TagPhraseEditor from './TagPhraseEditor';
import CopyPromptButton from '../ui/CopyPromptButton';
import {
  TAG_CONTENT_SECTIONS,
  getInitialView,
  getShortHookCategories,
  parentOf,
  resolvePoolEditorProps,
  pickTagPhrasePlaceholders,
} from '../../utils/tagContentSections';
import { isSourceMatch } from '../../utils/tagFieldTabs';
import { buildHookPlaceholders } from '../../utils/hookPlaceholders';
import { buildTagShortHooksPrompt } from '../../utils/authorPromptContexts';

const SECTION_LABEL = Object.fromEntries(
  TAG_CONTENT_SECTIONS.map((section) => [section.id, section.label]),
);

// Stage 2: Descriptions still renders through the old TagFieldTab (multi-pool).
// Its dedicated drill screens land in Stage 3; until then any
// description-level view routes to the legacy tab and "back" collapses
// straight to the overview.
const isLegacyDescriptionView = (view) =>
  view?.level === 'descriptionGroups' || view?.level === 'descriptionPool';

function shouldOpenEditor(tag, sourceTarget) {
  return sourceTarget?.tagName === tag.name;
}

const phraseCountLabel = (n) => `${n} ${n === 1 ? 'phrase' : 'phrases'}`;

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

  const shortHookLabelOf = (categoryKey) =>
    getShortHookCategories(projectConfig).find((cat) => cat.id === categoryKey)?.label ||
    categoryKey;

  const goBack = () => {
    if (isLegacyDescriptionView(view)) {
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
          <TagDrillHeader backLabel={tag.label} title="Basics" onBack={goBack} />
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
            backLabel={tag.label}
            title={SECTION_LABEL[view.field]}
            subtitle={phraseCountLabel(phrases.length)}
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

    if (view.level === 'shortHookCategories') {
      return (
        <>
          <TagDrillHeader backLabel={tag.label} title="Short Hooks" onBack={goBack} />
          <TagShortHookCategoryList
            tag={tag}
            projectConfig={projectConfig}
            onOpenCategory={(cat) =>
              setManualView({ level: 'shortHookPool', category: cat.id })
            }
          />
        </>
      );
    }

    if (view.level === 'shortHookPool') {
      const { field, parentField, parentValue, phrases } = resolvePoolEditorProps(tag, view);
      const label = shortHookLabelOf(view.category);
      const matched =
        sourceTarget?.tagName === tag.name && isSourceMatch(sourceTarget, { field });
      return (
        <>
          <TagDrillHeader
            backLabel="Short Hooks"
            title={label}
            subtitle={phraseCountLabel(phrases.length)}
            onBack={goBack}
          />
          <TagPhraseEditor
            noWrapper
            tagName={tag.name}
            field={field}
            parentField={parentField}
            parentValue={parentValue}
            phrases={phrases}
            placeholders={buildHookPlaceholders(projectConfig)}
            onUpdateTag={onUpdateTag}
            highlightText={matched ? sourceTarget.phraseText ?? sourceTarget.hookText : null}
            actionsSlot={
              <CopyPromptButton
                getPrompt={() =>
                  buildTagShortHooksPrompt(projectConfig, {
                    tag,
                    hookCategoryKey: view.category,
                    hookCategoryLabel: label,
                    phrases,
                  })
                }
              />
            }
          />
        </>
      );
    }

    if (isLegacyDescriptionView(view)) {
      return (
        <>
          <TagDrillHeader backLabel={tag.label} title="Descriptions" onBack={goBack} />
          <TagFieldTab
            tabId="descriptions"
            tag={tag}
            onUpdateTag={onUpdateTag}
            sourceTarget={sourceTarget}
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
