import TemplateGroupCard from '../ui/TemplateGroupCard';
import HookTemplateEditor from '../ui/HookTemplateEditor';
import IconButton from '../ui/IconButton';
import LabelSliderRow from '../ui/LabelSliderRow';
import { THUMBNAIL_TAG_PLACEHOLDER } from '../../utils/hookPlaceholders';

// Stores overrides at projectSettingsOverrides.thumbnail.{words,fallbacks,genericTagTemplates,patterns.{long,shorts}},
// which buildResolvedProjectConfig.js already merges correctly (including a nested merge for patterns).
export default function ProjectSettingsThumbnails({
  projectConfig,
  projectSettingsOverrides = {},
  updateProjectOverride,
  thumbnailsTarget = null,
}) {
  const thumbnailConfig = projectConfig.thumbnail || {};
  const thumbnailOverrides = projectSettingsOverrides.thumbnail || {};

  function updateArray(key, newArray) {
    updateProjectOverride({
      thumbnail: {
        ...thumbnailOverrides,
        [key]: newArray,
      },
    });
  }

  function resetArray(key) {
    const { [key]: _removed, ...remaining } = thumbnailOverrides;
    updateProjectOverride({ thumbnail: remaining });
  }

  function updatePattern(poolKey, newArray) {
    updateProjectOverride({
      thumbnail: {
        ...thumbnailOverrides,
        patterns: {
          ...(thumbnailOverrides.patterns || {}),
          [poolKey]: newArray,
        },
      },
    });
  }

  function resetPattern(poolKey) {
    const { [poolKey]: _removed, ...remainingPatterns } = thumbnailOverrides.patterns || {};
    updateProjectOverride({
      thumbnail: {
        ...thumbnailOverrides,
        patterns: remainingPatterns,
      },
    });
  }

  return (
    <section>
      <h2 className="panel-title">Thumbnail Templates</h2>

      <div className="tag-library tag-library--3col">
        <TemplateGroupCard
          label="Generation"
          onReset={() => resetArray('count')}
        >
          <LabelSliderRow
            label="Thumbnails to generate"
            value={thumbnailConfig.count ?? 5}
            min={1}
            max={10}
            onChange={(v) => updateArray('count', v)}
          />
        </TemplateGroupCard>

        <TemplateGroupCard
          label="Words"
          subtitle="Used when no transformation tags are selected."
          templates={thumbnailConfig.words || []}
          onUpdateTemplates={(v) => updateArray('words', v)}
          onReset={() => resetArray('words')}
          placeholders={[]}
          highlightText={thumbnailsTarget?.card === 'words' ? thumbnailsTarget.template : null}
        />

        <TemplateGroupCard
          label="Fallbacks"
          subtitle="Fills remaining thumbnail slots after tag-mapped phrases run out."
          templates={thumbnailConfig.fallbacks || []}
          onUpdateTemplates={(v) => updateArray('fallbacks', v)}
          onReset={() => resetArray('fallbacks')}
          placeholders={[]}
          highlightText={thumbnailsTarget?.card === 'fallbacks' ? thumbnailsTarget.template : null}
        />

        <TemplateGroupCard
          label="Generic Tag Templates"
          subtitle="Used for selected tags with no specific thumbnail phrases. {tag} is replaced with the tag name."
          templates={thumbnailConfig.genericTagTemplates || []}
          onUpdateTemplates={(v) => updateArray('genericTagTemplates', v)}
          onReset={() => resetArray('genericTagTemplates')}
          placeholders={THUMBNAIL_TAG_PLACEHOLDER}
          highlightText={thumbnailsTarget?.card === 'genericTagTemplates' ? thumbnailsTarget.template : null}
        />

        <TemplateGroupCard
          label="Patterns"
          subtitle="Valid values: artistFull, artistShort, song — anything else falls back to song."
        >
          <div className="tag-card-label-row">
            <h4>Long</h4>
            <IconButton icon="↺" title="Reset Long patterns" onClick={() => resetPattern('long')} />
          </div>
          <HookTemplateEditor
            templates={thumbnailConfig.patterns?.long || []}
            onUpdateTemplates={(v) => updatePattern('long', v)}
            placeholders={[]}
            noWrapper
          />

          <div className="tag-card-label-row" style={{ marginTop: 'var(--space-4)' }}>
            <h4>Shorts</h4>
            <IconButton icon="↺" title="Reset Shorts patterns" onClick={() => resetPattern('shorts')} />
          </div>
          <HookTemplateEditor
            templates={thumbnailConfig.patterns?.shorts || []}
            onUpdateTemplates={(v) => updatePattern('shorts', v)}
            placeholders={[]}
            noWrapper
          />
        </TemplateGroupCard>
      </div>
    </section>
  );
}
