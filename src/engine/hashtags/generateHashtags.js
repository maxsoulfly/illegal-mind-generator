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
  const baseTags = config.hashtags?.base || [];
  const baseYTTags = config.youtubetags?.base || [];
  const MAX_HASHTAGS = config.hashtags?.maxCount ?? 18;
  const MAX_YOUTUBE_TAGS = config.youtubetags?.maxCount ?? 20;

  const customTags = (formData.customHashtags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map(toHashtag);

  const dynamicTags = [
    formData.artist ? toHashtag(formData.artist) : null,
    formData.song ? toHashtag(formData.song) : null,
  ].filter(Boolean);

  const selectedTags = formData?.transformationTags || [];

  const tagBasedHashtags = selectedTags
    .filter((tag) => !config.tags?.[tag]?.excludeFromHashtags)
    .flatMap((tag) => {
      const configHashtags = config.tags?.[tag]?.hashtags || [];

      return configHashtags.length > 0 ? configHashtags : [tag];
    })
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
      ...selectedTags.filter((tag) => !config.tags?.[tag]?.excludeFromHashtags),
      ...selectedTags
        .filter((tag) => !config.tags?.[tag]?.excludeFromHashtags)
        .flatMap((tag) => config.tags?.[tag]?.hashtags || []),
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
    .slice(0, MAX_YOUTUBE_TAGS)
    .join(', ');

  return {
    youtubeTags,
    hashtags: [...new Set(allTags)]
      .filter(Boolean)
      .slice(0, MAX_HASHTAGS)
      .join(' '),
  };
}
