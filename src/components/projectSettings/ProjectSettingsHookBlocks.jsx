import { useState } from 'react';
import HookTemplateEditor from '../ui/HookTemplateEditor';
import FormSelect from '../ui/FormSelect';
import IconButton from '../ui/IconButton';
import LabelSliderRow from '../ui/LabelSliderRow';

// Hook block definitions live in projects.json → description.hookBlocks.
// Each entry: { key, label, path, templateKey, scope?, countMax?, countDefault? }
// path: 'long' | 'top' (description root) | 'shorts'
// countMax: initial max-lines value (user can change from UI)
// countDefault: initial slider value

const SCOPE_OPTIONS = [
  { value: 'project', label: 'Project' },
  { value: 'song',    label: 'Song' },
];

function HookBlockEditor({
  label, templates, scope, target, hasOverride,
  maxLines, countValue,
  onUpdateTemplates, onReset, onScopeChange, onMaxLinesChange, onCountChange,
}) {
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
          <span className="hook-block-target">{target}</span>
          <FormSelect value={scope} onChange={onScopeChange} options={SCOPE_OPTIONS} />
          <label className="hook-block-max-label">
            max
            <input
              key={maxLines}
              type="number"
              min="1"
              className="form-input hook-block-max-input"
              defaultValue={maxLines}
              onBlur={(e) => onMaxLinesChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </label>
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
          {maxLines > 1 && (
            <LabelSliderRow
              label="Lines to show"
              min={1}
              max={maxLines}
              value={countValue}
              onChange={onCountChange}
            />
          )}
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
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const overriddenDesc   = projectSettingsOverrides.description || {};
  const overriddenLong   = projectSettingsOverrides.description?.templates?.long    || {};
  const overriddenShorts = projectSettingsOverrides.description?.templates?.shorts  || {};

  const longTemplates   = projectConfig.description?.templates?.long    || {};
  const shortsTemplates = projectConfig.description?.templates?.shorts  || {};
  const descConfig      = projectConfig.description || {};

  function getTemplates({ path, templateKey }) {
    if (path === 'long')   return longTemplates[templateKey]   || [];
    if (path === 'top')    return descConfig[templateKey]      || [];
    if (path === 'shorts') return shortsTemplates[templateKey] || [];
    return [];
  }

  function getMaxLines({ key, countMax }) {
    return overriddenDesc.hookBlockMaxLines?.[key] ?? countMax ?? 1;
  }

  function getCountValue(block) {
    const max = getMaxLines(block);
    const stored = overriddenDesc.hookBlockCounts?.[block.key] ?? block.countDefault ?? 1;
    return Math.min(stored, max);
  }

  function isOverridden({ key, path, templateKey }) {
    const tplOverridden =
      path === 'long'   ? templateKey in overriddenLong
      : path === 'top'  ? templateKey in overriddenDesc
      : path === 'shorts' ? templateKey in overriddenShorts
      : false;
    return (
      tplOverridden ||
      (overriddenDesc.hookBlockMaxLines != null && key in overriddenDesc.hookBlockMaxLines) ||
      (overriddenDesc.hookBlockCounts   != null && key in overriddenDesc.hookBlockCounts)
    );
  }

  function updateTemplates({ path, templateKey }, newTemplates) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    if (path === 'long') {
      updateProjectOverride({
        description: { ...overriddenDesc, templates: { ...templates_, long: { ...overriddenLong, [templateKey]: newTemplates } } },
      });
    } else if (path === 'top') {
      updateProjectOverride({
        description: { ...overriddenDesc, [templateKey]: newTemplates },
      });
    } else if (path === 'shorts') {
      updateProjectOverride({
        description: { ...overriddenDesc, templates: { ...templates_, shorts: { ...overriddenShorts, [templateKey]: newTemplates } } },
      });
    }
  }

  function resetBlock({ key, path, templateKey }) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    const { [key]: _mx, ...remainingMaxLines } = overriddenDesc.hookBlockMaxLines || {};
    const { [key]: _cv, ...remainingCounts   } = overriddenDesc.hookBlockCounts   || {};

    if (path === 'long') {
      const { [templateKey]: _t, ...remainingLong } = overriddenLong;
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          hookBlockMaxLines: remainingMaxLines,
          hookBlockCounts:   remainingCounts,
          templates: { ...templates_, long: remainingLong },
        },
      });
    } else if (path === 'top') {
      const { [templateKey]: _t, ...remaining } = overriddenDesc;
      updateProjectOverride({
        description: { ...remaining, hookBlockMaxLines: remainingMaxLines, hookBlockCounts: remainingCounts },
      });
    } else if (path === 'shorts') {
      const { [templateKey]: _t, ...remainingShorts } = overriddenShorts;
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          hookBlockMaxLines: remainingMaxLines,
          hookBlockCounts:   remainingCounts,
          templates: { ...templates_, shorts: remainingShorts },
        },
      });
    }
  }

  function getScope(key) {
    return overriddenLong.phraseBlockScopes?.[key] ?? 'project';
  }

  function updateScope(key, scope) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        templates: {
          ...templates_,
          long: {
            ...overriddenLong,
            phraseBlockScopes: { ...(overriddenLong.phraseBlockScopes || {}), [key]: scope },
          },
        },
      },
    });
  }

  function updateMaxLines(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockMaxLines: { ...(overriddenDesc.hookBlockMaxLines || {}), [key]: value },
      },
    });
  }

  function updateCount(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockCounts: { ...(overriddenDesc.hookBlockCounts || {}), [key]: value },
      },
    });
  }

  const hookBlocks = projectConfig.description?.hookBlocks || [];

  return (
    <>
      {hookBlocks.map((block) => {
        const { key } = block;
        return (
          <HookBlockEditor
            key={key}
            label={block.label}
            templates={getTemplates(block)}
            scope={getScope(key)}
            target={block.path === 'shorts' ? 'Shorts' : 'Long'}
            hasOverride={isOverridden(block)}
            maxLines={getMaxLines(block)}
            countValue={getCountValue(block)}
            onUpdateTemplates={(t) => updateTemplates(block, t)}
            onReset={() => resetBlock(block)}
            onScopeChange={(val) => updateScope(key, val)}
            onMaxLinesChange={(val) => updateMaxLines(key, val)}
            onCountChange={(val) => updateCount(key, val)}
          />
        );
      })}
    </>
  );
}
