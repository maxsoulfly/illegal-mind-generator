import { useState } from 'react';
import HookTemplateEditor from '../ui/HookTemplateEditor';
import FormSelect from '../ui/FormSelect';
import IconButton from '../ui/IconButton';

const HOOK_BLOCKS = [
  { key: 'storyBlock', label: 'Story Block', templateKey: 'storyBlock' },
  { key: 'logBlock',   label: 'Log Block',   templateKey: 'logNotes' },
];

const SCOPE_OPTIONS = [
  { value: 'project', label: 'Project' },
  { value: 'song',    label: 'Song' },
];

function HookBlockEditor({ label, templates, scope, hasOverride, onUpdateTemplates, onReset, onScopeChange }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <article className={`tag-card${collapsed ? ' tag-card--collapsed' : ''}`}>
      <header className="tag-card-header">
        <div className="tag-card-label-row">
          <h3 className="tag-card-toggle" onClick={() => setCollapsed((c) => !c)}>
            <span className="tag-card-collapse-icon">{collapsed ? '▶' : '▼'}</span>
            {label}
          </h3>
          <span className="tag-status">{templates.length} templates</span>
        </div>
        <div className="links-editor-badges">
          <FormSelect value={scope} onChange={onScopeChange} options={SCOPE_OPTIONS} />
          <IconButton
            icon="↺"
            title="Reset to defaults"
            onClick={hasOverride ? onReset : undefined}
            disabled={!hasOverride}
          />
        </div>
      </header>

      {!collapsed && (
        <div className="tag-editor-section">
          <HookTemplateEditor
            templates={templates}
            onUpdateTemplates={onUpdateTemplates}
            noWrapper
          />
        </div>
      )}
    </article>
  );
}

export default function ProjectSettingsHookBlocks({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const longTemplates = projectConfig.description?.templates?.long || {};
  const baseLongTemplates = baseProjectConfig?.description?.templates?.long || {};
  const overriddenLong = projectSettingsOverrides.description?.templates?.long || {};

  function getTemplates(templateKey) {
    return longTemplates[templateKey] || [];
  }

  function hasTemplateOverride(templateKey) {
    return templateKey in overriddenLong;
  }

  function updateTemplates(templateKey, newTemplates) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        templates: {
          ...(projectSettingsOverrides.description?.templates || {}),
          long: {
            ...overriddenLong,
            [templateKey]: newTemplates,
          },
        },
      },
    });
  }

  function resetTemplates(templateKey) {
    const { [templateKey]: _removed, ...remaining } = overriddenLong;
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        templates: {
          ...(projectSettingsOverrides.description?.templates || {}),
          long: remaining,
        },
      },
    });
  }

  function getScope(key) {
    return overriddenLong.phraseBlockScopes?.[key] ?? 'song';
  }

  function updateScope(key, scope) {
    updateProjectOverride({
      description: {
        ...(projectSettingsOverrides.description || {}),
        templates: {
          ...(projectSettingsOverrides.description?.templates || {}),
          long: {
            ...overriddenLong,
            phraseBlockScopes: {
              ...(overriddenLong.phraseBlockScopes || {}),
              [key]: scope,
            },
          },
        },
      },
    });
  }

  return (
    <>
      {HOOK_BLOCKS.map(({ key, label, templateKey }) => (
        <HookBlockEditor
          key={key}
          label={label}
          templates={getTemplates(templateKey)}
          scope={getScope(key)}
          hasOverride={hasTemplateOverride(templateKey)}
          onUpdateTemplates={(t) => updateTemplates(templateKey, t)}
          onReset={() => resetTemplates(templateKey)}
          onScopeChange={(val) => updateScope(key, val)}
        />
      ))}
    </>
  );
}
