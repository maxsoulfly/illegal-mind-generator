import TemplateGroupCard from '../ui/TemplateGroupCard';
import LabelSliderRow from '../ui/LabelSliderRow';
import IconButton from '../ui/IconButton';

// Stores overrides at projectSettingsOverrides.hashtags.{base,maxCount} and
// projectSettingsOverrides.youtubetags.{base,maxCount}, which
// buildResolvedProjectConfig.js already merges correctly (same shallow
// nested-merge treatment as thumbnail). Per-tag hashtags/excludeFromHashtags
// live in the Tag Library instead — this tab only covers the project-level
// base pools generateHashtags.js always includes, plus the output caps.
export default function ProjectSettingsHashtags({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  hashtagsTarget = null,
}) {
  const hashtagConfig = projectConfig.hashtags || {};
  const hashtagOverrides = projectSettingsOverrides.hashtags || {};
  const youtubeTagConfig = projectConfig.youtubetags || {};
  const youtubeTagOverrides = projectSettingsOverrides.youtubetags || {};

  function updateHashtags(key, value) {
    updateProjectOverride({
      hashtags: {
        ...hashtagOverrides,
        [key]: value,
      },
    });
  }

  function resetHashtags(key) {
    const { [key]: _removed, ...remaining } = hashtagOverrides;
    updateProjectOverride({ hashtags: remaining });
  }

  function updateYoutubeTags(key, value) {
    updateProjectOverride({
      youtubetags: {
        ...youtubeTagOverrides,
        [key]: value,
      },
    });
  }

  function resetYoutubeTags(key) {
    const { [key]: _removed, ...remaining } = youtubeTagOverrides;
    updateProjectOverride({ youtubetags: remaining });
  }

  return (
    <section>
      <h2 className="panel-title">Hashtags &amp; YouTube Tags</h2>

      <div className="tag-library tag-library--3col">
        <TemplateGroupCard label="Generation">
          <div className="tag-card-label-row">
            <h4>Max Hashtags</h4>
            <IconButton icon="↺" title="Reset to default" onClick={() => resetHashtags('maxCount')} />
          </div>
          <LabelSliderRow
            label="Hashtags to include"
            value={hashtagConfig.maxCount ?? 18}
            min={5}
            max={30}
            onChange={(v) => updateHashtags('maxCount', v)}
          />

          <div className="tag-card-label-row" style={{ marginTop: 'var(--space-4)' }}>
            <h4>Max YouTube Tags</h4>
            <IconButton icon="↺" title="Reset to default" onClick={() => resetYoutubeTags('maxCount')} />
          </div>
          <LabelSliderRow
            label="YouTube tags to include"
            value={youtubeTagConfig.maxCount ?? 20}
            min={5}
            max={30}
            onChange={(v) => updateYoutubeTags('maxCount', v)}
          />
        </TemplateGroupCard>

        <TemplateGroupCard
          label="Base Hashtags"
          subtitle="Always included, on top of tag-based and per-song hashtags."
          templates={hashtagConfig.base || []}
          onUpdateTemplates={(v) => updateHashtags('base', v)}
          onReset={() => resetHashtags('base')}
          placeholders={[]}
          highlightText={hashtagsTarget?.card === 'hashtagsBase' ? hashtagsTarget.template : null}
        />

        <TemplateGroupCard
          label="Base YouTube Tags"
          subtitle="Always included, on top of tag-based and per-song YouTube tags."
          templates={youtubeTagConfig.base || []}
          onUpdateTemplates={(v) => updateYoutubeTags('base', v)}
          onReset={() => resetYoutubeTags('base')}
          placeholders={[]}
          highlightText={hashtagsTarget?.card === 'youtubeTagsBase' ? hashtagsTarget.template : null}
        />
      </div>
    </section>
  );
}
