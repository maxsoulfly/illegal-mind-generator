import HookTemplateEditor from '../projectSettings/HookTemplateEditor';

// Edits persist immediately via onUpdateTemplates, which replaces the full
// templates array for this hook type in the project override storage.
// onReset removes the override entirely, restoring the base project config.
export default function ShortHookCard({ hookType, hookConfig, onUpdateTemplates, onReset, highlightText }) {
  const phraseCount = hookConfig.templates?.length || 0;

  return (
    <article className="tag-card">
      <header className="tag-card-header">
        <h3>{hookConfig.label}</h3>

        <button
          type="button"
          className="tag-reset-button"
          title="Reset hook group"
          onClick={onReset}
        >
          ↺
        </button>

        <span className="tag-status">{phraseCount} phrases</span>
      </header>

      <p className="tag-category">{hookType}</p>

      <HookTemplateEditor
        templates={hookConfig.templates}
        onUpdateTemplates={onUpdateTemplates}
        highlightText={highlightText}
      />
    </article>
  );
}
