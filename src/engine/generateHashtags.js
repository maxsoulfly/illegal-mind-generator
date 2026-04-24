function toHashtag(text) {
  if (!text) return '';

  const cleaned = text
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, '') // keep letters (any language) + numbers
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return cleaned ? `#${cleaned}` : '';
}

export function generateHashtags(formData = {}, config = {}) {
  const baseTags = config.hashtags || [];
  const baseYTTags = config.youtubetags || [];
  const MAX_HASHTAGS = 18;

  const customTags = (formData.customHashtags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map(toHashtag);

  const dynamicTags = [
    formData.artist ? toHashtag(formData.artist) : null,
    formData.song ? toHashtag(formData.song) : null,
    // formData.videoType ? toHashtag(formData.videoType) : null,
  ].filter(Boolean);

  const tagBasedHashtags = (formData?.transformationTags || []).map(toHashtag);

  const allTags = [
    ...baseTags,
    ...dynamicTags,
    ...tagBasedHashtags,
    ...customTags,
  ];

  const youtubeTags = [
    ...baseYTTags,
    ...new Set([
      formData.artist,
      formData.song,
      ...formData.transformationTags,
      ...(formData.customHashtags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    ]),
  ]
    .filter(Boolean)
    .slice(0, 20)
    .join(', ');

  return {
    hashtags: [...new Set(allTags)].slice(0, MAX_HASHTAGS).join(' '),
    youtubeTags,
  };
}
