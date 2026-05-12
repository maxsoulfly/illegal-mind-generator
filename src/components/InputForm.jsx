import { useEffect } from 'react';
import { getVisibleTags } from '../utils/tagRegistry';

import useTagOverrides from '../hooks/useTagOverrides';

import BasicSongFields from './input/BasicSongFields';
import TransformationTagSelector from './input/TransformationTagSelector';
import ToggleButton from './ToggleButton';

function InputForm({
  projectId,
  formData,
  setFormData,
  onClear,
  projectConfig,
  onSaveEntry,
  savedEntries,
  tagUsage = {},
  panelVisibility,
  togglePanel,
}) {
  const { projectOverrides } = useTagOverrides(projectId);
  const visibleTags = getVisibleTags(projectConfig, projectOverrides);

  const visibleTagNamesKey = visibleTags.map(([tagName]) => tagName).join('|');

  const artistSuggestions = [
    ...new Set(savedEntries.map((entry) => entry.artist)),
  ]
    .filter(Boolean)
    .filter((artist) =>
      artist.toLowerCase().includes(formData.artist.toLowerCase()),
    );

  const artistValue = formData.artist.trim().toLowerCase();

  const songSuggestions = [
    ...new Set(
      savedEntries
        .filter((entry) => entry.artist.trim().toLowerCase() === artistValue)
        .map((entry) => entry.song)
        .filter(Boolean),
    ),
  ];

  useEffect(() => {
    const artistValue = formData.artist.trim().toLowerCase();
    const songValue = formData.song.trim().toLowerCase();

    const match = savedEntries.find(
      (entry) =>
        entry.artist.trim().toLowerCase() === artistValue &&
        entry.song.trim().toLowerCase() === songValue,
    );

    if (!match) return;

    setFormData((prev) => ({
      ...prev,
      signalNumber: match.signalNumber || prev.signalNumber,
    }));
  }, [formData.artist, formData.song, savedEntries, setFormData]);

  useEffect(() => {
    if (!formData.useCustomArtistShort) return;
    const words = (formData.artist || '').trim().split(' ').filter(Boolean);
    let short = formData.artist || 'ARTIST';

    if (words.length >= 3) {
      short = words.map((w) => w[0]).join('');
    }

    setFormData((prev) => ({
      ...prev,
      artistShort: short.toUpperCase(),
    }));
  }, [formData.artist, formData.useCustomArtistShort]);

  useEffect(() => {
    const allowedTags = visibleTagNamesKey.split('|');

    setFormData((prev) => ({
      ...prev,
      transformationTags: (prev.transformationTags || []).filter((tag) =>
        allowedTags.includes(tag),
      ),
    }));
  }, [visibleTagNamesKey, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === 'project') {
        return {
          ...prev,
          project: value,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleTagToggle = (tag) => {
    const currentTags = formData.transformationTags || [];
    const isSelected = currentTags.includes(tag);

    setFormData((prev) => {
      const prevTags = prev.transformationTags || [];

      return {
        ...prev,
        transformationTags: isSelected
          ? prevTags.filter((item) => item !== tag)
          : [...prevTags, tag],
      };
    });
  };

  return (
    <div>
      <h2>Input</h2>
      <BasicSongFields
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        artistSuggestions={artistSuggestions}
        songSuggestions={songSuggestions}
      />

      <ToggleButton
        isOpen={panelVisibility.advanced}
        onClick={() => togglePanel('advanced')}
        label="Advanced Options"
      />
      {panelVisibility.advanced && (
        <div className="advanced-options">
          {/* TRANSFORMATION TAGS */}
          <TransformationTagSelector
            visibleTags={visibleTags}
            tagUsage={tagUsage}
            formData={formData}
            onTagToggle={handleTagToggle}
          />

          {/* CUSTOM STORY BLOCK */}
          <div className="form-group">
            <label className="form-label" htmlFor="customStory">
              Custom Story Block
            </label>
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
          </div>
          
          {/* CUSTOM LOG NOTE */}
          <div className="form-group">
            <label className="form-label" htmlFor="customLogNote">
              Custom Log Note
            </label>
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

            <label className="form-label">Additional Hashtags</label>

            {/* ADDITIONAL HASHTAGS */}
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
            {/* CUSTOM CTA */}

            <textarea
              id="customCta"
              className="form-textarea"
              value={formData.customCta}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customCta: e.target.value,
                }))
              }
              rows={4}
              placeholder="Write a custom CTA for comments..."
            />
          </div>
        </div>
      )}

      <div className="button-row">
        <button
          className="button-secondary"
          type="button"
          onClick={onSaveEntry}
        >
          Save to&nbsp;
          <span className="text-accent-soft">{projectConfig.name}</span>
        </button>

        <button className="button-secondary" onClick={onClear}>
          Clear Form
        </button>
      </div>
    </div>
  );
}

export default InputForm;
