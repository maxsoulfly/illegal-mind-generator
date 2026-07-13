import TemplateGroupCard from '../ui/TemplateGroupCard';

// todoStatuses is a flat top-level projects.json array, so the existing
// top-level spread in buildResolvedProjectConfig.js's mergeProjectOverrides()
// already merges an override correctly — no dedicated merge block needed.
// Renaming/removing a status has no migration for saved entries already
// using the old string — they become invisible (filtered out of every
// section on the Todo page) rather than deleted. See Known Gotchas.
export default function ProjectSettingsTodo({
  projectConfig,
  updateProjectOverride,
  resetProjectOverride,
}) {
  const statuses = projectConfig.todoStatuses || [];

  return (
    <section>
      <h2 className="panel-title">Todo Settings</h2>

      <div className="tag-library tag-library--3col">
        <TemplateGroupCard
          label="Statuses"
          subtitle="Cover planning workflow stages, shown as sections on the Todo page. The first status is used for Bulk Add."
          templates={statuses}
          onUpdateTemplates={(v) => updateProjectOverride({ todoStatuses: v })}
          onReset={() => resetProjectOverride('todoStatuses')}
          placeholders={[]}
        />
      </div>
    </section>
  );
}
