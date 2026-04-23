function toHashtag(text) {
  return `#${text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')}`;
}

export function generateHashtags(formData = {}, config = {}) {
  const baseTags = config.hashtags || [];

  const dynamicTags = [
    formData.artist ? toHashtag(formData.artist) : null,
    formData.song ? toHashtag(formData.song) : null,
    formData.videoType ? toHashtag(formData.videoType) : null,
  ].filter(Boolean);

  const tagBasedHashtags = (formData?.transformationTags || []).map(toHashtag);

  const allTags = [...baseTags, ...dynamicTags, ...tagBasedHashtags];

  return [...new Set(allTags)].join(' ');
}
