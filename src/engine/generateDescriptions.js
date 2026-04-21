function toTitleCase(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

function replaceLinkPlaceholders(template, links = {}) {
  return template.replace(/\{links\.(.*?)\}/g, (_, key) => {
    return links?.[key] ?? '';
  });
}

function buildTagLine(formData) {
  const tags = (formData.transformationTags || []).map(toTitleCase);

  if (tags.length === 0) {
    return 'rebuilt with a different weight and tone';
  }

  if (tags.length === 1) {
    return `rebuilt with a ${tags[0]} angle`;
  }

  if (tags.length === 2) {
    return `rebuilt with a ${tags[0]} and ${tags[1]} approach`;
  }

  return `rebuilt with a ${tags.slice(0, -1).join(', ')} and ${tags[tags.length - 1]} approach`;
}

export function generateDescriptions(formData, projectConfig) {
  const tagLine = buildTagLine(formData);

  // --- Broadcast block ---
  const operatorStatuses = projectConfig?.operatorStatuses || [];

  const operatorStatus =
    operatorStatuses[Math.floor(Math.random() * operatorStatuses.length)] ||
    'unstable cycle';

  const fileId = formData.signalNumber || '00';

  // --- Intro block ---
  const introTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.introHook,
  );

  // --- Broadcast block ---

  const broadcastTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.broadcastHeader,
  );
  const broadcastBlock = broadcastTemplate
    .replace(/\{fileId\}/g, fileId)
    .replace(/\{operatorStatus\}/g, operatorStatus);

  // --- Story block ---
  const storyTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.storyBlock,
  );

  const storyBlock = storyTemplate
    .replace(/\{artist\}/g, formData.artist || '')
    .replace(/\{song\}/g, formData.song || '')
    .replace(/\{tagLine\}/g, tagLine);

  // --- Log block ---
  const logTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.logBlock,
  );

  const logBlock = logTemplate.replace(/\{tagLine\}/g, tagLine);

  // --- Support block ---
  const supportTemplate =
    projectConfig?.descriptionTemplates?.long?.supportBlock?.[0] ?? '';

  const supportBlock = replaceLinkPlaceholders(
    supportTemplate,
    projectConfig?.links,
  );

  // --- Closing block ---
  const closingTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.closingSignal,
  );

  const closingBlock = closingTemplate.replace(
    /\{num\}/g,
    formData.signalNumber || '00',
  );

  // --- Long description ---
  const longDescription = [
    broadcastBlock,
    '',
    introTemplate,
    '',
    storyBlock,
    '',
    logBlock,
    '',
    supportBlock,
    '',
    closingBlock,
  ].join('\n');

  // --- Shorts ---
  const shortTemplates = projectConfig?.descriptionTemplates?.shorts || [];

  const shortDescriptions = shortTemplates.map((template) =>
    template
      .replace(/\{num\}/g, formData.signalNumber || '00')
      .replace(/\{artist\}/g, formData.artist || '')
      .replace(/\{song\}/g, formData.song || '')
      .replace(/\{tagLine\}/g, tagLine),
  );

  return {
    shortDescriptions,
    longDescription,
  };
}
