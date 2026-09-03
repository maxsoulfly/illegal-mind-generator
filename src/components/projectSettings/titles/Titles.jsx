import HookTemplateEditor from '../../ui/HookTemplateEditor';
import CopyPromptButton from '../../ui/CopyPromptButton';
import IconButton from '../../ui/IconButton';
import TitleGenerationCard from './TitleGenerationCard';
import PrimaryTagSection from './PrimaryTagSection';
import { buildTitlePoolPrompt } from '../../../utils/authorPromptContexts';

const GROUP_LABELS = {
  standard: 'Standard',
  butIts:   "But It's",
  generic:  'Generic',
};

const GENERATION_SETTINGS_KEYS = [
  'count',
  'prefix', 'longSuffix', 'shortsPrefix', 'shortsSuffix',
  'prefixEnabled', 'longSuffixEnabled', 'shortsPrefixEnabled', 'shortsSuffixEnabled',
  'connector', 'listSeparator', 'maxTransformationPhrases',
];

// Stores template overrides at projectSettingsOverrides.title.templates[groupName],
// which mergeProjectOverrides already knows how to shallow-merge per group.
export default function Titles({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  titlesTarget = null,
}) {
  const groups = Object.keys(projectConfig.title?.templates || {});
  const titleConfig = projectConfig.title || {};
  // {primaryTag} resolution config — moved here from the Short Hooks tab
  // (it has always been stored under title.primaryTag and drives both title
  // templates and {primaryTag}-using Short Hook templates).
  const primaryTagConfig = titleConfig.primaryTag || {};

  function updatePrimaryTagConfig(key, value) {
    updateProjectOverride({
      title: {
        ...(projectSettingsOverrides.title || {}),
        primaryTag: {
          count: primaryTagConfig.count ?? 1,
          order: primaryTagConfig.order ?? 'selection',
          separator: primaryTagConfig.separator ?? ' & ',
          [key]: value,
        },
      },
    });
  }

  function resetPrimaryTagConfig() {
    const { primaryTag: _removed, ...remaining } = projectSettingsOverrides.title || {};
    updateProjectOverride({ title: remaining });
  }

  function updateTitleSetting(key, value) {
    updateProjectOverride({
      title: {
        ...(projectSettingsOverrides.title || {}),
        [key]: value,
      },
    });
  }

  function resetGenerationSettings() {
    const remaining = { ...(projectSettingsOverrides.title || {}) };
    GENERATION_SETTINGS_KEYS.forEach((k) => delete remaining[k]);
    updateProjectOverride({ title: remaining });
  }

  function updateGroupTemplates(groupName, newTemplates) {
    updateProjectOverride({
      title: {
        ...(projectSettingsOverrides.title || {}),
        templates: {
          ...(projectSettingsOverrides.title?.templates || {}),
          [groupName]: newTemplates,
        },
      },
    });
  }

  function resetGroup(groupName) {
    const { [groupName]: _removed, ...remaining } =
      projectSettingsOverrides.title?.templates || {};
    updateProjectOverride({
      title: {
        ...(projectSettingsOverrides.title || {}),
        templates: remaining,
      },
    });
  }

  return (
    <>
      <h2 className="panel-title">Titles</h2>

      <div className="tag-library tag-library--3col">
        <TitleGenerationCard
          titleConfig={titleConfig}
          onUpdate={updateTitleSetting}
          onReset={resetGenerationSettings}
        />

        <article className="tag-card tag-card--settings">
          <header className="tag-card-header">
            <h3>Primary Tag</h3>
            <IconButton
              icon="↺"
              title="Reset to defaults"
              onClick={resetPrimaryTagConfig}
            />
          </header>
          <PrimaryTagSection config={primaryTagConfig} onUpdate={updatePrimaryTagConfig} />
        </article>

        {groups.map((groupName) => {
          const templates = projectConfig.title.templates[groupName] || [];
          const label = GROUP_LABELS[groupName] || groupName;

          return (
            <article key={groupName} className="tag-card">
              <header className="tag-card-header">
                <div className="tag-card-label-row">
                  <h3>{label}</h3>
                  <button
                    type="button"
                    className="tag-reset-button"
                    data-tooltip="Reset to defaults"
                    aria-label="Reset to defaults"
                    onClick={() => resetGroup(groupName)}
                  >
                    ↺
                  </button>
                  <CopyPromptButton
                    getPrompt={() =>
                      buildTitlePoolPrompt(projectConfig, {
                        groupName,
                        groupLabel: label,
                        templates,
                      })
                    }
                  />
                </div>
                <span className="tag-status">{templates.length} templates</span>
              </header>

              <HookTemplateEditor
                templates={templates}
                onUpdateTemplates={(newTemplates) =>
                  updateGroupTemplates(groupName, newTemplates)
                }
                highlightText={titlesTarget?.groupName === groupName ? titlesTarget.template : null}
              />
            </article>
          );
        })}
      </div>
    </>
  );
}
