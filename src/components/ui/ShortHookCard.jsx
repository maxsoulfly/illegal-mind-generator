import TemplateGroupCard from './TemplateGroupCard';

// Edits persist immediately via onUpdateTemplates, which replaces the full
// templates array for this hook type in the project override storage.
// onReset removes the override entirely, restoring the base project config.
export default function ShortHookCard({ hookType, hookConfig, onUpdateTemplates, onReset, onUpdateFlags, highlightText }) {
  return (
    <TemplateGroupCard
      label={hookConfig.label}
      templates={hookConfig.templates}
      onUpdateTemplates={onUpdateTemplates}
      onReset={onReset}
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
              <span className="toggle-label">Exclude for Faithful</span>
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
              <span className="toggle-label">Requires Genre</span>
            </label>
          </div>
        </div>
      )}
    </TemplateGroupCard>
  );
}
