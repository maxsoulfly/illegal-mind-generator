import LinksRegistryEditor from './lists/LinksRegistryEditor';

export default function ProjectSettingsLinks({
  baseProjectConfig,
  projectConfig,
  projectSettingsOverrides,
  updateProjectOverride,
}) {
  return (
    <>
      <h2 className="panel-title">Links</h2>

      <LinksRegistryEditor
        baseProjectConfig={baseProjectConfig}
        projectConfig={projectConfig}
        projectSettingsOverrides={projectSettingsOverrides}
        updateProjectOverride={updateProjectOverride}
      />
    </>
  );
}
