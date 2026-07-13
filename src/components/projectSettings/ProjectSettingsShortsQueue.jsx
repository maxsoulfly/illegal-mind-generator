import TemplateGroupCard from '../ui/TemplateGroupCard';
import LabelSliderRow from '../ui/LabelSliderRow';
import IconButton from '../ui/IconButton';

// Stores overrides at projectSettingsOverrides.shortsQueue.{length,duplicateSpacing},
// which buildResolvedProjectConfig.js merges via a dedicated nested-merge
// block (same shallow shape as hashtags/youtubetags). Read by useShortsQueue.js.
export default function ProjectSettingsShortsQueue({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
}) {
  const queueConfig = projectConfig.shortsQueue || {};
  const queueOverrides = projectSettingsOverrides.shortsQueue || {};

  function updateQueue(key, value) {
    updateProjectOverride({
      shortsQueue: {
        ...queueOverrides,
        [key]: value,
      },
    });
  }

  function resetQueue(key) {
    const { [key]: _removed, ...remaining } = queueOverrides;
    updateProjectOverride({ shortsQueue: remaining });
  }

  return (
    <section>
      <h2 className="panel-title">Shorts Queue</h2>

      <div className="tag-library tag-library--3col">
        <TemplateGroupCard label="Generation">
          <div className="tag-card-label-row">
            <h4>Queue Length</h4>
            <IconButton icon="↺" title="Reset to default" onClick={() => resetQueue('length')} />
          </div>
          <LabelSliderRow
            label="Covers per queue"
            value={queueConfig.length ?? 20}
            min={5}
            max={50}
            onChange={(v) => updateQueue('length', v)}
          />

          <div className="tag-card-label-row" style={{ marginTop: 'var(--space-4)' }}>
            <h4>Duplicate Spacing</h4>
            <IconButton icon="↺" title="Reset to default" onClick={() => resetQueue('duplicateSpacing')} />
          </div>
          <LabelSliderRow
            label="Slots before a song can repeat"
            value={queueConfig.duplicateSpacing ?? 2}
            min={1}
            max={10}
            onChange={(v) => updateQueue('duplicateSpacing', v)}
          />
        </TemplateGroupCard>
      </div>
    </section>
  );
}
