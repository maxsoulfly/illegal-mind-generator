import TemplateGroupCard from './TemplateGroupCard';

// Edits persist immediately via onUpdateTemplates, which replaces the full
// templates array for this hook type in the project override storage.
// onReset restores JSON defaults; for user-created types pass onRemove instead.
export default function ShortHookCard({ hookType, hookConfig, onUpdateTemplates, onReset, onRemove, onUpdateFlags, highlightText }) {
  return (
    <TemplateGroupCard
      label={hookConfig.label}
      templates={hookConfig.templates}
      onUpdateTemplates={onUpdateTemplates}
      onReset={onReset}
      onRemove={onRemove}
      highlightText={highlightText}
      subtitle={hookType}
      countLabel="phrases"
    >
      {onUpdateFlags && (
        <div className="form-group">
          <div>
            <label className="toggle-row">
              <input
                className="toggle-checkbox"
                type="checkbox"
                checked={!!hookConfig.excludeForFaithful}
                onChange={(e) => onUpdateFlags({ excludeForFaithful: e.target.checked })}
              />
              Exclude for Faithful
            </label>
          </div>
          <div>
            <label className="toggle-row">
              <input
                className="toggle-checkbox"
                type="checkbox"
                checked={!!hookConfig.requiresGenre}
                onChange={(e) => onUpdateFlags({ requiresGenre: e.target.checked })}
              />
              Requires Genre
            </label>
          </div>
        </div>
      )}
    </TemplateGroupCard>
  );
}
