import TemplateGroupCard from './TemplateGroupCard';

// Edits persist immediately via onUpdateTemplates, which replaces the full
// templates array for this hook type in the project override storage.
// onReset removes the override entirely, restoring the base project config.
export default function ShortHookCard({ hookType, hookConfig, onUpdateTemplates, onReset, highlightText }) {
  return (
    <TemplateGroupCard
      label={hookConfig.label}
      templates={hookConfig.templates}
      onUpdateTemplates={onUpdateTemplates}
      onReset={onReset}
      highlightText={highlightText}
      subtitle={hookType}
      countLabel="phrases"
    />
  );
}
