function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

export function generateShortDescriptions(
  formData,
  projectConfig,
  shortHooks = [],
  tagPhrase = '',
) {
  const shortsConfig = projectConfig.description.templates.shorts;
  const count = shortsConfig.count || 3;
  const coverLabel = shortsConfig.coverLabel || '';

  const shortsLayout = shortsConfig.layout || [
    'coverLine',
    'hook',
    'secondary',
  ];

  // shortHooks is an array of groups, each with a `hooks` array of hook objects.
  // We only need the text string from each hook object for use in descriptions.
  const hookTextPool = shortHooks.flatMap((hookGroup) => {
    const hooksInGroup = hookGroup.hooks || [];
    return hooksInGroup.map((hook) => hook.text || '');
  });

  function renderShortLine(blockName) {
    if (blockName === 'coverLine') {
      const headerTemplates = shortsConfig.header || [];
      const template =
        pickRandom(headerTemplates) || '{artist} - {song}';

      return template
        .replace(/\{artist\}/g, formData.artist || '')
        .replace(/\{song\}/g, formData.song || '')
        .replace(/\{coverLabel\}/g, coverLabel)
        .replace(/\{num\}/g, formData.signalNumber || '00');
    }

    if (blockName === 'hook') {
      return pickRandom(hookTextPool);
    }

    const options = shortsConfig[blockName] || [];
    const template = pickRandom(options);

    return template
      .replace(/\{num\}/g, formData.signalNumber || '00')
      .replace(/\{artist\}/g, formData.artist || '')
      .replace(/\{song\}/g, formData.song || '')
      .replace(/\{tagLine\}/g, tagPhrase)
      .replace(/\{coverLabel\}/g, coverLabel);
  }

  const shortDescriptions = [];

  for (let i = 0; i < count; i++) {
    const text = shortsLayout.map(renderShortLine).filter(Boolean).join('\n');
    shortDescriptions.push(text);
  }

  return shortDescriptions;
}
