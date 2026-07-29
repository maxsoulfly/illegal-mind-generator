import { useEffect } from 'react';

import FormField from '../ui/FormField';
import SongBlockOverrideFields from './SongBlockOverrideFields';

export default function AdvancedDescriptionFields({
  formData,
  setFormData,
  projectConfig,
  songOverrideTarget,
  clearSongOverrideTarget,
}) {
  const customHashtagsTargeted = songOverrideTarget?.blockKey === 'customHashtags';

  // Same click-to-scroll mechanism DescriptionsPanel's song-override links use
  // (openSongOverride({blockKey})) — customHashtags isn't a songBlockOverrides
  // entry like the fields in SongBlockOverrideFields below, so it needs its
  // own small scroll effect here rather than reusing that subcomponent's.
  useEffect(() => {
    if (!customHashtagsTargeted) return;
    const el = document.getElementById('song-override-customHashtags');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [customHashtagsTargeted]);

  return (
    <div className="form-group">
      <FormField
        label="Additional Hashtags"
        id="song-override-customHashtags"
        className={customHashtagsTargeted ? 'tag-section--highlight' : ''}
      >
        <input
          type="text"
          className="form-input"
          value={formData.customHashtags || ''}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              customHashtags: e.target.value,
            }));
            if (customHashtagsTargeted) clearSongOverrideTarget?.();
          }}
          placeholder="tag1, tag2, tag3"
        />
      </FormField>

      <SongBlockOverrideFields
        formData={formData}
        setFormData={setFormData}
        projectConfig={projectConfig}
        songOverrideTarget={songOverrideTarget}
        clearSongOverrideTarget={clearSongOverrideTarget}
      />
    </div>
  );
}
