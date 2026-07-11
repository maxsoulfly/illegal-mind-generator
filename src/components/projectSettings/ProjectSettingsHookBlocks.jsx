import HookTemplateEditor from '../ui/HookTemplateEditor';
import BlockEditorCard from './blocks/BlockEditorCard';
import AddBlockForm from './blocks/AddBlockForm';

// Hook block definitions live in projects.json → description.hookBlocks.
// Each entry: { key, label, path, templateKey, scope?, countMax?, countDefault?, descriptionLayoutKey? }
// path: 'long' | 'top' (description root) | 'shorts'

const OVERRIDE_TYPE_OPTIONS = [
  { value: 'textarea', label: 'Textarea' },
  { value: 'one-line', label: 'One-line' },
];

function HookBlockEditor({
  label,
  templates,
  scope,
  target,
  overrideType,
  hasOverride,
  maxLines,
  countValue,
  onUpdateTemplates,
  onReset,
  onDelete,
  isCore,
  onToggleCore,
  onRename,
  onScopeChange,
  onTargetChange,
  onOverrideTypeChange,
  onMaxLinesChange,
  onCountChange,
  open,
  highlightText,
}) {
  const pct =
    maxLines > 1 ? `${((countValue - 1) / (maxLines - 1)) * 100}%` : '0%';

  return (
    <BlockEditorCard
      label={label}
      badge={`${templates.length} templates`}
      scope={scope}
      target={target}
      onScopeChange={onScopeChange}
      onTargetChange={onTargetChange}
      hasOverride={hasOverride}
      onReset={onReset}
      onDelete={onDelete}
      isCore={isCore}
      onToggleCore={onToggleCore}
      onRename={onRename}
      open={open}
    >
      <div className="tag-phrase-row hook-block-lines-row">
        {scope === 'song' && (
          <>
            <span className="form-label">Override</span>
            <select
              className="form-select"
              style={{ flex: '0 0 auto', width: 'auto' }}
              value={overrideType}
              onChange={(e) => onOverrideTypeChange(e.target.value)}
            >
              {OVERRIDE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </>
        )}
        {maxLines > 1 && <span className="form-label">Lines</span>}
        {maxLines > 1 ? (
          <input
            type="range"
            min={1}
            max={maxLines}
            value={countValue}
            style={{ '--val': pct }}
            onChange={(e) => onCountChange(Number(e.target.value))}
          />
        ) : (
          <span className="hook-block-lines-empty" />
        )}
        {maxLines > 1 && (
          <span className="tag-status">{countValue}</span>
        )}
        <label className="hook-block-max-label">
          max
          <input
            key={maxLines}
            type="number"
            min="1"
            className="form-input hook-block-max-input"
            defaultValue={maxLines}
            onBlur={(e) =>
              onMaxLinesChange(
                Math.max(1, parseInt(e.target.value, 10) || 1),
              )
            }
          />
        </label>
      </div>
      <HookTemplateEditor
        templates={templates}
        onUpdateTemplates={onUpdateTemplates}
        highlightText={highlightText}
        noWrapper
      />
    </BlockEditorCard>
  );
}

export default function ProjectSettingsHookBlocks({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  openBlockKey,
  highlightText,
}) {
  const overriddenDesc = projectSettingsOverrides.description || {};
  const overriddenLong =
    projectSettingsOverrides.description?.templates?.long || {};
  const overriddenShorts =
    projectSettingsOverrides.description?.templates?.shorts || {};

  const longTemplates = projectConfig.description?.templates?.long || {};
  const shortsTemplates = projectConfig.description?.templates?.shorts || {};
  const descConfig = projectConfig.description || {};

  function getTemplates({ path, templateKey }) {
    if (path === 'long') return longTemplates[templateKey] || [];
    if (path === 'top') return descConfig[templateKey] || [];
    if (path === 'shorts') return shortsTemplates[templateKey] || [];
    return [];
  }

  function getMaxLines({ key, countMax }) {
    return overriddenDesc.hookBlockMaxLines?.[key] ?? countMax ?? 1;
  }

  function getCountValue(block) {
    const max = getMaxLines(block);
    const stored =
      overriddenDesc.hookBlockCounts?.[block.key] ?? block.countDefault ?? 1;
    return Math.min(stored, max);
  }

  function getTarget({ key, path }) {
    return (
      overriddenDesc.hookBlockTargets?.[key] ??
      (path === 'shorts' ? 'shorts' : 'long')
    );
  }

  function isOverridden({ key, path, templateKey }) {
    const tplOverridden =
      path === 'long'
        ? templateKey in overriddenLong
        : path === 'top'
          ? templateKey in overriddenDesc
          : path === 'shorts'
            ? templateKey in overriddenShorts
            : false;
    return (
      tplOverridden ||
      (overriddenDesc.hookBlockMaxLines != null &&
        key in overriddenDesc.hookBlockMaxLines) ||
      (overriddenDesc.hookBlockCounts != null &&
        key in overriddenDesc.hookBlockCounts) ||
      (overriddenDesc.hookBlockTargets != null &&
        key in overriddenDesc.hookBlockTargets) ||
      (overriddenDesc.hookBlockOverrideTypes != null &&
        key in overriddenDesc.hookBlockOverrideTypes)
    );
  }

  function updateTemplates({ path, templateKey }, newTemplates) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    if (path === 'long') {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          templates: {
            ...templates_,
            long: { ...overriddenLong, [templateKey]: newTemplates },
          },
        },
      });
    } else if (path === 'top') {
      updateProjectOverride({
        description: { ...overriddenDesc, [templateKey]: newTemplates },
      });
    } else if (path === 'shorts') {
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          templates: {
            ...templates_,
            shorts: { ...overriddenShorts, [templateKey]: newTemplates },
          },
        },
      });
    }
  }

  function resetBlock({ key, path, templateKey }) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    const { [key]: _mx, ...remainingMaxLines } =
      overriddenDesc.hookBlockMaxLines || {};
    const { [key]: _cv, ...remainingCounts } =
      overriddenDesc.hookBlockCounts || {};
    const { [key]: _tgt, ...remainingTargets } =
      overriddenDesc.hookBlockTargets || {};
    const { [key]: _lbl, ...remainingLabelOverrides } =
      overriddenDesc.hookBlockLabelOverrides || {};
    const { [key]: _ot, ...remainingOverrideTypes } =
      overriddenDesc.hookBlockOverrideTypes || {};

    if (path === 'long') {
      const { [templateKey]: _t, ...remainingLong } = overriddenLong;
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          hookBlockMaxLines: remainingMaxLines,
          hookBlockCounts: remainingCounts,
          hookBlockTargets: remainingTargets,
          hookBlockLabelOverrides: remainingLabelOverrides,
          hookBlockOverrideTypes: remainingOverrideTypes,
          templates: { ...templates_, long: remainingLong },
        },
      });
    } else if (path === 'top') {
      const { [templateKey]: _t, ...remaining } = overriddenDesc;
      updateProjectOverride({
        description: {
          ...remaining,
          hookBlockMaxLines: remainingMaxLines,
          hookBlockCounts: remainingCounts,
          hookBlockTargets: remainingTargets,
          hookBlockLabelOverrides: remainingLabelOverrides,
          hookBlockOverrideTypes: remainingOverrideTypes,
        },
      });
    } else if (path === 'shorts') {
      const { [templateKey]: _t, ...remainingShorts } = overriddenShorts;
      updateProjectOverride({
        description: {
          ...overriddenDesc,
          hookBlockMaxLines: remainingMaxLines,
          hookBlockCounts: remainingCounts,
          hookBlockTargets: remainingTargets,
          hookBlockLabelOverrides: remainingLabelOverrides,
          hookBlockOverrideTypes: remainingOverrideTypes,
          templates: { ...templates_, shorts: remainingShorts },
        },
      });
    }
  }

  function renameJsonBlock(key, newLabel) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockLabelOverrides: {
          ...(overriddenDesc.hookBlockLabelOverrides || {}),
          [key]: newLabel,
        },
      },
    });
  }

  function renameDynamicBlock(key, newLabel) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customHookBlocks: (overriddenDesc.customHookBlocks || []).map((b) =>
          b.key === key ? { ...b, label: newLabel } : b,
        ),
      },
    });
  }

  function getOverrideType(key) {
    return overriddenDesc.hookBlockOverrideTypes?.[key] ?? 'textarea';
  }

  function updateOverrideType(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockOverrideTypes: {
          ...(overriddenDesc.hookBlockOverrideTypes || {}),
          [key]: value,
        },
      },
    });
  }

  // defaultScope is per-block config (projects.json), not a hardcoded key
  // check — storyBlock/logBlock set it to 'song' there since that's their
  // historical default; every other hook block implicitly defaults to
  // 'project'. Must match AdvancedDescriptionFields.jsx's precedence exactly.
  function getScope(key, defaultScope) {
    return overriddenLong.phraseBlockScopes?.[key] ?? defaultScope ?? 'project';
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
            phraseBlockScopes: {
              ...(overriddenLong.phraseBlockScopes || {}),
              [key]: scope,
            },
          },
        },
      },
    });
  }

  function updateTarget(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockTargets: {
          ...(overriddenDesc.hookBlockTargets || {}),
          [key]: value,
        },
      },
    });
  }

  function updateMaxLines(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockMaxLines: {
          ...(overriddenDesc.hookBlockMaxLines || {}),
          [key]: value,
        },
      },
    });
  }

  function updateCount(key, value) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        hookBlockCounts: {
          ...(overriddenDesc.hookBlockCounts || {}),
          [key]: value,
        },
      },
    });
  }

  const hookBlocks = projectConfig.description?.hookBlocks || [];
  const customBlocks = projectConfig.description?.templates?.long?.customBlocks || {};
  const dynamicHookBlockKeys = new Set(
    (overriddenDesc.customHookBlocks || []).map((b) => b.key),
  );

  function getHookBlockCore(key) {
    return (overriddenDesc.customHookBlocks || []).find((b) => b.key === key)?.isCore || false;
  }

  function toggleHookBlockCore(key) {
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customHookBlocks: (overriddenDesc.customHookBlocks || []).map((b) =>
          b.key === key ? { ...b, isCore: !b.isCore } : b,
        ),
      },
    });
  }

  function addHookBlock(key, name, scope, target) {
    const templates_ = projectSettingsOverrides.description?.templates || {};
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customHookBlocks: [
          ...(overriddenDesc.customHookBlocks || []),
          { key, label: name, isCore: false },
        ],
        hookBlockTargets: { ...(overriddenDesc.hookBlockTargets || {}), [key]: target },
        templates: {
          ...templates_,
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

  function deleteHookBlock(key) {
    if (getHookBlockCore(key)) return;
    if (!window.confirm(`Delete this hook block? This cannot be undone.`)) return;
    const templates_ = projectSettingsOverrides.description?.templates || {};
    const { [key]: _tpl, ...remainingLongBase } = overriddenLong;
    const { [key]: _sc, ...remainingScopes } = overriddenLong.phraseBlockScopes || {};
    const { [key]: _mx, ...remainingMaxLines } = overriddenDesc.hookBlockMaxLines || {};
    const { [key]: _cv, ...remainingCounts } = overriddenDesc.hookBlockCounts || {};
    const { [key]: _tgt, ...remainingTargets } = overriddenDesc.hookBlockTargets || {};
    const { [key]: _ot, ...remainingOverrideTypes } = overriddenDesc.hookBlockOverrideTypes || {};
    updateProjectOverride({
      description: {
        ...overriddenDesc,
        customHookBlocks: (overriddenDesc.customHookBlocks || []).filter(
          (b) => b.key !== key,
        ),
        hookBlockMaxLines: remainingMaxLines,
        hookBlockCounts: remainingCounts,
        hookBlockTargets: remainingTargets,
        hookBlockOverrideTypes: remainingOverrideTypes,
        templates: {
          ...templates_,
          long: { ...remainingLongBase, phraseBlockScopes: remainingScopes },
        },
      },
    });
  }

  // Must include the layout-key namespace (descriptionLayoutKey) too, not
  // just hook blocks' own storage keys — see ProjectSettingsTextBlocks.jsx.
  const existingKeys = [
    ...hookBlocks.map((b) => b.key),
    ...hookBlocks.map((b) => b.descriptionLayoutKey ?? b.key),
    ...Object.keys(customBlocks),
  ];

  return (
    <>
      {hookBlocks.map((block) => {
        const { key } = block;
        const isDynamic = dynamicHookBlockKeys.has(key);
        const effectiveLabel =
          overriddenDesc.hookBlockLabelOverrides?.[key] ?? block.label;
        return (
          <HookBlockEditor
            key={key}
            label={effectiveLabel}
            templates={getTemplates(block)}
            scope={getScope(key, block.defaultScope)}
            target={getTarget(block)}
            overrideType={getOverrideType(key)}
            hasOverride={
              !isDynamic &&
              (isOverridden(block) || !!overriddenDesc.hookBlockLabelOverrides?.[key])
            }
            maxLines={getMaxLines(block)}
            countValue={getCountValue(block)}
            onUpdateTemplates={(t) => updateTemplates(block, t)}
            onReset={!isDynamic ? () => resetBlock(block) : undefined}
            onDelete={isDynamic ? () => deleteHookBlock(key) : undefined}
            isCore={isDynamic ? getHookBlockCore(key) : undefined}
            onToggleCore={isDynamic ? () => toggleHookBlockCore(key) : undefined}
            onRename={
              isDynamic
                ? (newLabel) => renameDynamicBlock(key, newLabel)
                : (newLabel) => renameJsonBlock(key, newLabel)
            }
            onScopeChange={(val) => updateScope(key, val)}
            onTargetChange={(val) => updateTarget(key, val)}
            onOverrideTypeChange={(val) => updateOverrideType(key, val)}
            onMaxLinesChange={(val) => updateMaxLines(key, val)}
            onCountChange={(val) => updateCount(key, val)}
            open={openBlockKey === key}
            highlightText={openBlockKey === key ? highlightText : null}
          />
        );
      })}
      <AddBlockForm
        placeholder="New hook block name (e.g. Sponsor Hook)"
        existingKeys={existingKeys}
        onAdd={addHookBlock}
      />
    </>
  );
}
