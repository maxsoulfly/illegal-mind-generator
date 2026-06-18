import { useState } from 'react';
import PlaceholderField from '../../ui/PlaceholderField';
import BlockEditorCard from './BlockEditorCard';

function textOf(blockData) {
  return typeof blockData === 'string' ? blockData : blockData?.text ?? '';
}

export default function TextBlockEditor({
  label,
  blockData,
  defaultScope,
  defaultTarget,
  linkKeys = [],
  hasOverride,
  onSave,
  onReset,
  onDelete,
  open,
}) {
  const [block, setBlock] = useState(() => ({
    text: textOf(blockData),
    scope: (typeof blockData === 'object' && blockData?.scope) || defaultScope,
    target: (typeof blockData === 'object' && blockData?.target) || defaultTarget,
    isCore: (typeof blockData === 'object' && blockData?.isCore) || false,
  }));
  const { text, scope, target, isCore } = block;

  function save(next) {
    setBlock(next);
    onSave({
      name: typeof blockData === 'object' ? blockData?.name : undefined,
      text: next.text,
      scope: next.scope,
      target: next.target,
      isCore: next.isCore,
    });
  }

  function handleToggleCore() {
    save({ ...block, isCore: !isCore });
  }

  function handleDelete() {
    if (isCore) return;
    if (window.confirm(`Delete "${label}"? This cannot be undone.`)) {
      onDelete();
    }
  }

  function handleTextBlur(nextText) {
    save({ ...block, text: nextText });
  }

  const placeholders = [
    '{artist}',
    '{song}',
    '{tagLine}',
    ...linkKeys.map((key) => `{links.${key}}`),
  ];

  function handleScopeChange(next) {
    save({ ...block, scope: next });
  }

  function handleTargetChange(next) {
    save({ ...block, target: next });
  }

  return (
    <BlockEditorCard
      label={label}
      scope={scope}
      target={target}
      onScopeChange={handleScopeChange}
      onTargetChange={handleTargetChange}
      hasOverride={hasOverride}
      onReset={onReset}
      onDelete={onDelete ? handleDelete : undefined}
      isCore={isCore}
      onToggleCore={handleToggleCore}
      open={open}
    >
      <div className="form-group">
        <div className="form-label">Text</div>
        <PlaceholderField
          multiline
          defaultValue={text}
          onBlur={handleTextBlur}
          placeholders={placeholders}
          rows={4}
        />
      </div>
    </BlockEditorCard>
  );
}
