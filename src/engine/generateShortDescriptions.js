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

  const shortsLayout = shortsConfig.layout || [
    'coverLine',
    'hook',
    'secondary',
  ];

  const coverLabel = shortsConfig.coverLabel || 'Cover';
  const hookPool = shortHooks.flatMap((group) => group.hooks || []);

  function renderShortLine(blockName) {
    if (blockName === 'coverLine') {
      return `${formData.artist || ''} - ${
        formData.song || ''
      } // ${coverLabel}`;
    }

    if (blockName === 'hook') {
      return pickRandom(hookPool);
    }

    const options = shortsConfig[blockName] || [];
    const template = pickRandom(options);

    return template
      .replace(/\{num\}/g, formData.signalNumber || '00')
      .replace(/\{artist\}/g, formData.artist || '')
      .replace(/\{song\}/g, formData.song || '')
      .replace(/\{tagLine\}/g, tagPhrase);
  }

  const shortDescriptions = [];

  for (let i = 0; i < count; i++) {
    const text = shortsLayout.map(renderShortLine).filter(Boolean).join('\n');

    shortDescriptions.push(text);
  }

  return shortDescriptions;
}
