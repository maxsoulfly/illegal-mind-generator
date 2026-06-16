import FormField from '../ui/FormField';
import PlaceholderField from '../ui/PlaceholderField';
import { isTextBlock, getBlockLabel } from '../../utils/customBlocks';

// Song-scoped Text blocks get a per-song override field here. Extend this
// loop (not a new mechanism) when List/Block Group gain song scope too —
// branch on block shape the same way StructuredListEditor/TextBlockEditor do.
function SongBlockOverrideFields({ formData, setFormData, projectConfig }) {
  const customBlocks = projectConfig?.description?.templates?.long?.customBlocks || {};
  const linkKeys = Object.keys(projectConfig?.description?.links || {});

  const songTextBlocks = Object.entries(customBlocks).filter(
    ([, block]) => isTextBlock(block) && typeof block === 'object' && block.scope === 'song',
  );

  if (songTextBlocks.length === 0) return null;

  const placeholders = ['{artist}', '{song}', '{tagLine}', ...linkKeys.map((key) => `{links.${key}}`)];

  function updateOverride(key, value) {
    setFormData((prev) => ({
      ...prev,
      songBlockOverrides: {
        ...(prev.songBlockOverrides || {}),
        [key]: value,
      },
    }));
  }

  return (
    <>
      {songTextBlocks.map(([key, block]) => {
        const label = getBlockLabel(key, block);

        return (
          <details key={key} className="tag-section">
            <summary>{label} (this song only)</summary>
            <FormField label={label}>
              <PlaceholderField
                multiline
                rows={3}
                defaultValue={formData.songBlockOverrides?.[key] || ''}
                onChange={(value) => updateOverride(key, value)}
                placeholders={placeholders}
                placeholder={`Override for this song only. Leave blank to use the project default.`}
              />
            </FormField>
          </details>
        );
      })}
    </>
  );
}

export default function AdvancedDescriptionFields({
  formData,
  setFormData,
  projectConfig,
}) {
  return (
    <>
      <div className="form-group">
        {/* CUSTOM STORY BLOCK */}
        <FormField label="Custom Story Block">
          <textarea
            id="customStory"
            className="form-textarea"
            value={formData.customStory}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customStory: e.target.value,
              }))
            }
            rows={5}
            placeholder="Write a custom story paragraph for the long description..."
          />
        </FormField>
      </div>

      {/* CUSTOM LOG NOTE */}
      <div className="form-group">
        <FormField label="Custom Log Note">
          <textarea
            id="customLogNote"
            className="form-textarea"
            value={formData.customLogNote}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customLogNote: e.target.value,
              }))
            }
            rows={4}
            placeholder="Write a custom operator/log note..."
          />
        </FormField>

        {/* ADDITIONAL HASHTAGS */}
        <FormField label="Additional Hashtags">
          <input
            type="text"
            className="form-input"
            value={formData.customHashtags || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customHashtags: e.target.value,
              }))
            }
            placeholder="tag1, tag2, tag3"
          />
        </FormField>

        {/* GEAR */}
        <FormField label="Gear">
          <textarea
            id="customGear"
            className="form-textarea"
            value={formData.customGear || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customGear: e.target.value,
              }))
            }
            rows={4}
            placeholder="List gear used for this recording..."
          />
        </FormField>

        <SongBlockOverrideFields
          formData={formData}
          setFormData={setFormData}
          projectConfig={projectConfig}
        />
      </div>
    </>
  );
}
