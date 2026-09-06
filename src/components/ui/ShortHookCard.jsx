import TemplateGroupCard from './TemplateGroupCard';
import FormField from './FormField';

// Edits persist immediately via onUpdateTemplates, which replaces the full
// templates array for this hook type in the project override storage.
// onReset restores JSON defaults; for user-created types pass onRemove instead.
// aiContext is an optional, UI-authored "what this category is for" note used
// only by Copy AI Prompt — never seeded from config, blank is valid.
export default function ShortHookCard({ hookType, hookConfig, onUpdateTemplates, onReset, onRemove, onUpdateFlags, aiContext = '', onUpdateAiContext, highlightText, actionsSlot }) {
  return (
    <TemplateGroupCard
      label={hookConfig.label}
      templates={hookConfig.templates}
      onUpdateTemplates={onUpdateTemplates}
      onReset={onReset}
      onRemove={onRemove}
      highlightText={highlightText}
      actionsSlot={actionsSlot}
      subtitle={hookType}
      countLabel="phrases"
    >
      {onUpdateAiContext && (
        <FormField label="AI Context / Purpose">
          <textarea
            key={aiContext}
            className="form-input"
            rows={2}
            defaultValue={aiContext}
            placeholder='What this category is for — e.g. "Conversation starters about the source song, artist, era, or scene." Optional; only used by Copy AI Prompt.'
            onBlur={(e) => onUpdateAiContext(e.target.value)}
          />
        </FormField>
      )}
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
