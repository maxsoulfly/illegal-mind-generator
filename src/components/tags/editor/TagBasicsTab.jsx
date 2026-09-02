// src/components/tags/editor/TagBasicsTab.jsx

import { useState } from 'react';

import FormField from '../../ui/FormField';
import ToggleField from '../../ui/ToggleField';
import FormSelect from '../../ui/FormSelect';

export default function TagBasicsTab({
  tag,
  categories,
  onUpdateTag,
  onToggleVisibility,
  onDuplicateTag,
  projectOverrides,
  resetTagOverride,
  otherProjects = [],
  onCopyTagFromProject,
}) {
  const [copySourceId, setCopySourceId] = useState(otherProjects[0]?.[0] || '');
  return (
    <>
      <div className="tag-edit-fields">
        <FormField label="Label">
          <input
            className="form-input"
            defaultValue={tag.label}
            onBlur={(e) =>
              onUpdateTag(tag.name, {
                label: e.target.value,
              })
            }
          />
        </FormField>

        <FormField label="Category">
          <select
            className="form-select"
            defaultValue={tag.category}
            onChange={(e) =>
              onUpdateTag(tag.name, {
                category: e.target.value,
              })
            }
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="What this tag means (for AI prompts)"
          className="tag-edit-fields__full"
        >
          <textarea
            className="form-input"
            rows={3}
            defaultValue={tag.promptContext}
            placeholder="e.g. 'Darker' = bleaker mood and minor-key reharmonization, subtracted brightness — not just 'sad'. Only used to give the Copy AI Prompt button semantic context; never shown in generated output."
            onBlur={(e) =>
              onUpdateTag(tag.name, {
                promptContext: e.target.value,
              })
            }
          />
        </FormField>

        <div className="tag-options">
          <ToggleField
            label="Exclude from hashtags"
            checked={tag.excludeFromHashtags}
            onChange={(checked) =>
              onUpdateTag(tag.name, {
                excludeFromHashtags: checked,
              })
            }
          />

          <ToggleField
            label='Exclude from "but it’s..."'
            checked={tag.excludeFromButIts}
            onChange={(checked) =>
              onUpdateTag(tag.name, {
                excludeFromButIts: checked,
              })
            }
          />
        </div>
      </div>

      <button
        type="button"
        className="button-secondary tag-visibility-toggle"
        onClick={() => onToggleVisibility(tag.name, tag.isVisible)}
      >
        {tag.isVisible ? 'Hide from Generator' : 'Show in Generator'}
      </button>

      <button
        type="button"
        className="button-secondary tag-visibility-toggle"
        onClick={() => onDuplicateTag?.(tag)}
      >
        Duplicate tag
      </button>

      {otherProjects.length > 0 && (
        <div className="tag-actions tag-visibility-toggle">
          <FormSelect
            value={copySourceId}
            onChange={setCopySourceId}
            options={otherProjects.map(([id, project]) => ({
              value: id,
              label: project.name,
            }))}
          />
          <button
            type="button"
            className="button-secondary"
            onClick={() => onCopyTagFromProject(tag.name, copySourceId)}
            disabled={!copySourceId}
          >
            Sync
          </button>
        </div>
      )}

      {projectOverrides?.[tag.name]?.isCustom && (
        <button
          type="button"
          className="tag-delete-button button-secondary"
          onClick={() => {
            const shouldDelete = window.confirm(`Delete "${tag.label}"?`);

            if (!shouldDelete) return;

            resetTagOverride(tag.name);
          }}
        >
          Delete custom tag
        </button>
      )}
    </>
  );
}
