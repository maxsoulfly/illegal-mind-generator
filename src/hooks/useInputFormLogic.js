import { useEffect } from 'react';

import { getVisibleTags } from '../utils/tagRegistry';
import useTagOverrides from './useTagOverrides';

export default function useInputFormLogic({
  projectId,
  formData,
  setFormData,
  projectConfig,
  savedEntries,
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
    // Only auto-fill when the field is empty — preserves custom values on
    // entry load and after manual edits.
    if (formData.artistShort) return;

    const words = (formData.artist || '').trim().split(' ').filter(Boolean);
    let short = formData.artist || 'ARTIST';

    if (words.length >= 3) {
      short = words.map((w) => w[0]).join('');
    }

    setFormData((prev) => ({
      ...prev,
      artistShort: short.toUpperCase(),
    }));
  }, [formData.artist, formData.useCustomArtistShort, formData.artistShort, setFormData]);

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  return {
    visibleTags,
    artistSuggestions,
    songSuggestions,
    handleChange,
    handleTagToggle,
    projectOverrides,
  };
}
