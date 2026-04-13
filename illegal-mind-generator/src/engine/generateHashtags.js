export function generateHashtags(formData, config) {
  const baseTags = config.hashtags;

  const dynamicTags = [
    `#${formData.artist.replace(/\s+/g, '')}`,
    `#${formData.song.replace(/\s+/g, '')}`,
    `#${formData.videoType}`,
  ];

  return [...baseTags, ...dynamicTags].join(' ');
}
