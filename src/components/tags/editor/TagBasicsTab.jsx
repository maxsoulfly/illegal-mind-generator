// src/components/tags/editor/TagBasicsTab.jsx

import FormField from '../../ui/FormField';
import ToggleField from '../../ui/ToggleField';

export default function TagBasicsTab({
  tag,
  categories,
  onUpdateTag,
  onToggleVisibility,
  onDuplicateTag,
  projectOverrides,
  resetTagOverride,
}) {
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