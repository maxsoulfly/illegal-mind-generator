import LinksRegistryEditor from './lists/LinksRegistryEditor';

export default function ProjectSettingsLinks({
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
}) {
  return (
    <>
      <h2 className="panel-title">Links</h2>

      <LinksRegistryEditor
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />
    </>
  );
}
