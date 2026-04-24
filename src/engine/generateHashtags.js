// Remove non-alphanumeric characters
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

// Remove non-alphanumeric characters
function cleanYoutubeTag(text) {
  return text
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate hashtags
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
    formData.artist && formData.song
      ? toHashtag(`${formData.artist} ${formData.song}`)
      : null,
  ].filter(Boolean);

  const tagBasedHashtags = (formData?.transformationTags || [])
    .slice(0, 5)
    .map(toHashtag);

  const allTags = [
    ...baseTags,
    ...dynamicTags,
    ...customTags,
    ...tagBasedHashtags,
  ];

  const rawYoutubeTags = [
    ...baseYTTags,
    ...new Set([
      formData.artist,
      formData.song,
      `${formData.artist} ${formData.song}`.toLowerCase(),
      ...formData.transformationTags,
      ...(formData.customHashtags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    ]),
  ].filter(Boolean);

  const youtubeTags = [
    ...new Set(
      rawYoutubeTags.map(cleanYoutubeTag).filter((tag) => tag.length > 2),
    ),
  ]
    .slice(0, 20)
    .join(', ');

  return {
    youtubeTags,
    hashtags: [...new Set(allTags)]
      .filter(Boolean)
      .slice(0, MAX_HASHTAGS)
      .join(' '),
  };
}
