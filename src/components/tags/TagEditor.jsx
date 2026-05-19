import FormField from '../ui/FormField';
import TagPhraseEditor from './TagPhraseEditor';

export default function TagEditor({
  tag,
  categories,
  onUpdateTag,
  onToggleVisibility,
}) {
  return (
    <details className="tag-section">
      <summary>Edit tag</summary>

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
      </div>

      <TagPhraseEditor
        title="Title phrases"
        tagName={tag.name}
        field="title"
        phrases={tag.maps.title}
        onUpdateTag={onUpdateTag}
      />

      <TagPhraseEditor
        title="Thumbnail phrases"
        tagName={tag.name}
        field="thumbnail"
        phrases={tag.maps.thumbnail}
        onUpdateTag={onUpdateTag}
      />

      <details className="tag-editor-section">
        <summary>Description phrases</summary>

        <div className="tag-editor-nested-section">
          <TagPhraseEditor
            title="Technical phrases"
            tagName={tag.name}
            parentField="description"
            parentValue={tag.maps.description}
            field="technical"
            phrases={tag.maps.description?.technical}
            onUpdateTag={onUpdateTag}
          />

          <TagPhraseEditor
            title="Log phrases"
            tagName={tag.name}
            parentField="description"
            parentValue={tag.maps.description}
            field="log"
            phrases={tag.maps.description?.log}
            onUpdateTag={onUpdateTag}
          />

          <TagPhraseEditor
            title="Status phrases"
            tagName={tag.name}
            parentField="description"
            parentValue={tag.maps.description}
            field="status"
            phrases={tag.maps.description?.status}
            onUpdateTag={onUpdateTag}
          />
        </div>
      </details>

      <button
        type="button"
        className="button-secondary tag-visibility-toggle"
        onClick={() => onToggleVisibility(tag.name, tag.isVisible)}
      >
        {tag.isVisible ? 'Hide from Generator' : 'Show in Generator'}
      </button>
    </details>
  );
}
