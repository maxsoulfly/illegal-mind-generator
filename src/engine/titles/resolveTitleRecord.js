import { fillPlaceholders } from '../placeholders';

function buildGeneratedArtistShort(artistRaw) {
  const words = artistRaw.trim().split(' ').filter(Boolean);

  if (words.length >= 3) {
    return words
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  return artistRaw;
}

// Titles built from lowercase placeholder values (originalGenre, tag
// categories) shouldn't produce a lowercase-leading title.
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Resolves the Long/Shorts prefix+suffix strings against live formData (only
// {num} is substituted here — see resolveRecordText). Split out so it can be
// called fresh at render time, reflecting a live Signal Number edit without
// re-picking anything.
function resolveWrapping(formData, config) {
  const isShorts = formData.videoType === 'Shorts';
  const num = formData.signalNumber || 'XX';

  const prefixEnabled = config.title?.prefixEnabled !== false;
  const longSuffixEnabled = config.title?.longSuffixEnabled !== false;
  const shortsPrefixEnabled = config.title?.shortsPrefixEnabled !== false;
  const shortsSuffixEnabled = config.title?.shortsSuffixEnabled !== false;

  // Support both 'prefix' and legacy 'longPrefix' key names.
  const longPrefixRaw = config.title?.prefix || config.title?.longPrefix || '';
  const longSuffixRaw = config.title?.longSuffix || '';
  const shortsPrefixRaw = config.title?.shortsPrefix || '';
  const shortsSuffixRaw = config.title?.shortsSuffix || '';

  return {
    isShorts,
    longPrefix: prefixEnabled ? longPrefixRaw.replace('{num}', num) : '',
    longSuffix: longSuffixEnabled ? longSuffixRaw.replace('{num}', num) : '',
    shortsPrefix: shortsPrefixEnabled ? shortsPrefixRaw.replace('{num}', num) : '',
    shortsSuffix: shortsSuffixEnabled ? shortsSuffixRaw.replace('{num}', num) : '',
  };
}

function resolveArtistSong(formData, isShorts) {
  const artistFull = formData.artist || '[Artist Name]';
  const generatedArtistShort = buildGeneratedArtistShort(artistFull);
  const artistShortFinal =
    formData.useCustomArtistShort && formData.artistShort
      ? formData.artistShort
      : generatedArtistShort;
  const useShort = isShorts || (formData.useCustomArtistShort && formData.artistShort);

  return {
    artist: useShort ? artistShortFinal : artistFull,
    song: formData.song || '[Song Name]',
  };
}

// Renders one picked record (see pickTitles) against live formData/config —
// pure substitution, no randomness. `record.transformation`/`record.template`
// are frozen picks; artist/song/num always come from the formData passed in
// here, so calling this with live formData is what makes Titles reflect a
// fresh Artist/Song/Artist Short/Signal Number edit without re-picking.
export function resolveRecordText(record, formData, config) {
  const { isShorts, longPrefix, longSuffix, shortsPrefix, shortsSuffix } = resolveWrapping(formData, config);

  if (record.kind === 'hook') {
    const baseTitle = capitalizeFirst(record.hook.rawText);
    const text = isShorts
      ? `${shortsPrefix}${baseTitle}${shortsSuffix}`
      : `${longPrefix}${baseTitle}${longSuffix}`;

    return {
      text,
      sourceHook: {
        sourceType: record.hook.sourceType,
        sourceTag: record.hook.sourceTag,
        hookType: record.hook.hookType,
        sourceText: record.hook.sourceText,
      },
      sourceTemplate: null,
    };
  }

  const { artist, song } = resolveArtistSong(formData, isShorts);
  const ctx = {
    formData,
    projectConfig: config,
    overrides: {
      artist,
      song,
      num: formData.signalNumber || 'XX',
      ...(record.kind === 'transformation' ? { transformation: record.transformation } : {}),
    },
  };

  const { text: filled } = fillPlaceholders(record.template, ctx);
  const baseTitle = capitalizeFirst(filled);
  const text = isShorts
    ? `${shortsPrefix}${baseTitle}${shortsSuffix}`
    : `${longPrefix}${baseTitle}${longSuffix}`;

  return { text, sourceHook: null, sourceTemplate: { template: record.template, groupName: record.groupName } };
}
