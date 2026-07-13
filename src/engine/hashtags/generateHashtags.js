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

// First-occurrence dedup on `text`, capped at `max` — equivalent to the
// previous [...new Set(arr)].filter(Boolean).slice(0, max) but keeps each
// entry's `source` for click-to-navigate.
function dedupEntries(entries, max) {
  const seen = new Set();
  const result = [];
  for (const entry of entries) {
    if (!entry.text || seen.has(entry.text)) continue;
    seen.add(entry.text);
    result.push(entry);
    if (result.length >= max) break;
  }
  return result;
}

// Generate hashtags
export function generateHashtags(formData = {}, config = {}) {
  const baseTags = config.hashtags?.base || [];
  const baseYTTags = config.youtubetags?.base || [];
  const MAX_HASHTAGS = config.hashtags?.maxCount ?? 18;
  const MAX_YOUTUBE_TAGS = config.youtubetags?.maxCount ?? 20;

  const selectedTags = formData?.transformationTags || [];
  const eligibleTags = selectedTags.filter((tag) => !config.tags?.[tag]?.excludeFromHashtags);

  const customHashtagWords = (formData.customHashtags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // --- Hashtags ---

  const baseEntries = baseTags.map((phrase) => ({
    text: phrase,
    source: { type: 'base', card: 'hashtagsBase', phrase },
  }));

  const dynamicEntries = [
    formData.artist
      ? { text: toHashtag(formData.artist), source: { type: 'field', field: 'artist' } }
      : null,
    formData.song
      ? { text: toHashtag(formData.song), source: { type: 'field', field: 'song' } }
      : null,
  ].filter(Boolean);

  const customEntries = customHashtagWords.map((word) => ({
    text: toHashtag(word),
    source: { type: 'override' },
  }));

  const tagEntries = eligibleTags.flatMap((tag) => {
    const configHashtags = config.tags?.[tag]?.hashtags || [];

    if (configHashtags.length > 0) {
      return configHashtags.map((phrase) => ({
        text: toHashtag(phrase),
        source: { type: 'tag', tagName: tag, phrase },
      }));
    }

    return [{ text: toHashtag(tag), source: { type: 'tag', tagName: tag, phrase: null } }];
  });

  const hashtags = dedupEntries(
    [...baseEntries, ...dynamicEntries, ...customEntries, ...tagEntries],
    MAX_HASHTAGS,
  );

  // --- YouTube tags ---

  const baseYTEntries = baseYTTags.map((phrase) => ({
    text: cleanYoutubeTag(phrase),
    source: { type: 'base', card: 'youtubeTagsBase', phrase },
  }));

  const dynamicYTEntries = [
    formData.artist
      ? { text: cleanYoutubeTag(formData.artist), source: { type: 'field', field: 'artist' } }
      : null,
    formData.song
      ? { text: cleanYoutubeTag(formData.song), source: { type: 'field', field: 'song' } }
      : null,
    // Combined "artist song" string doesn't cleanly map to one field — stays non-interactive.
    { text: cleanYoutubeTag(`${formData.artist} ${formData.song}`.toLowerCase()), source: null },
  ].filter(Boolean);

  const tagNameYTEntries = eligibleTags.map((tag) => ({
    text: cleanYoutubeTag(tag),
    source: { type: 'tag', tagName: tag, phrase: null },
  }));

  const tagHashtagYTEntries = eligibleTags.flatMap((tag) =>
    (config.tags?.[tag]?.hashtags || []).map((phrase) => ({
      text: cleanYoutubeTag(phrase),
      source: { type: 'tag', tagName: tag, phrase },
    })),
  );

  const customYTEntries = customHashtagWords.map((word) => ({
    text: cleanYoutubeTag(word),
    source: { type: 'override' },
  }));

  const youtubeTags = dedupEntries(
    [
      ...baseYTEntries,
      ...dynamicYTEntries,
      ...tagNameYTEntries,
      ...tagHashtagYTEntries,
      ...customYTEntries,
    ].filter((entry) => entry.text.length > 2),
    MAX_YOUTUBE_TAGS,
  );

  return { hashtags, youtubeTags };
}
