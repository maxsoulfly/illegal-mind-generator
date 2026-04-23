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

  const fileCore =
  (formData.song || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('') || 'SIG';

const fileId = `${fileCore}-${formData.signalNumber || '00'}`;

  // --- Intro block ---
  const introTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.introHook,
  );

  // --- Status block ---
  const selectedTags = formData.transformationTags || [];
  const descriptionTagMap = projectConfig?.descriptionTagMap || {};

  // collect tag-based status lines
  const tagStatusLines = selectedTags.flatMap(
    (tag) => descriptionTagMap[tag]?.status || [],
  );

  // fallback to global status lines
  const baseStatusLines =
    projectConfig?.descriptionTemplates?.long?.statusLines || [];

  // merge (tag lines first)
  const combinedStatus = [...tagStatusLines, ...baseStatusLines];

  // pick 2
  const selectedStatus = [...combinedStatus]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  const statusBlock = selectedStatus.join('\n');

  // --- Broadcast block ---

  const broadcastTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.broadcastHeader,
  );
  const broadcastHeader = broadcastTemplate
    .replace(/\{fileId\}/g, fileId)
    .replace(/\{operatorStatus\}/g, operatorStatus);

  const broadcastBlock = [broadcastHeader, statusBlock]
    .filter(Boolean)
    .join('\n');

  // --- Story block ---
  const storyTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.storyBlock,
  );

  const storyBlock = formData.customStory?.trim()
    ? formData.customStory.trim()
    : storyTemplate
        .replace(/\{artist\}/g, formData.artist || '')
        .replace(/\{song\}/g, formData.song || '')
        .replace(/\{tagLine\}/g, tagLine);

  // --- Support block ---
  const supportTemplate =
    projectConfig?.descriptionTemplates?.long?.supportBlock?.[0] ?? '';

  const supportBlock = replaceLinkPlaceholders(
    supportTemplate,
    projectConfig?.links,
  );

  // --- Philosophy block ---
  const philosophyTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.philosophyLine,
  );

  const philosophyBlock = philosophyTemplate;

  // --- Closing block ---
  const closingTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.closingSignal,
  );

  const closingBlock = closingTemplate.replace(
    /\{num\}/g,
    formData.signalNumber || '00',
  );

  // --- Technical block ---
  // const selectedTags = formData.transformationTags || [];
  // const descriptionTagMap = projectConfig?.descriptionTagMap || [];

  // Step 1: pick one line per tag
  const perTagLines = selectedTags
    .map((tag) => {
      const options = descriptionTagMap[tag]?.technical || [];
      return pickRandom(options);
    })
    .filter(Boolean);

  // Step 2: if less than 3, fill from all available
  const allLines = selectedTags.flatMap(
    (tag) => descriptionTagMap[tag]?.technical || [],
  );

  const remaining = allLines
    .filter((line) => !perTagLines.includes(line))
    .sort(() => 0.5 - Math.random());

  const finalLines = [...perTagLines, ...remaining].slice(0, 3);

  const technicalBlock = finalLines.join('\n');

  // --- Story block ---
  const logLines = selectedTags
    .map((tag) => {
      const options = descriptionTagMap[tag]?.log || [];
      return pickRandom(options);
    })
    .filter(Boolean);
  const shuffledLogs = logLines.sort(() => 0.5 - Math.random());

  const tagLogBlock = shuffledLogs.slice(0, 1).join('\n');

  // --- Log block ---
  const logTemplate = pickRandom(
    projectConfig?.descriptionTemplates?.long?.logBlock,
  );

  const baseLogBlock = logTemplate
    .replace(/\{tagLine\}/g, tagLine)
    .replace(
      'Operator Note: Signal stabilized under Illegal Mind control.',
      formData.customLogNote?.trim()
        ? `Operator Note: ${formData.customLogNote.trim()}`
        : 'Operator Note: Signal stabilized under Illegal Mind control.',
    );

  const logBlock = [baseLogBlock, tagLogBlock].filter(Boolean).join('\n');

  // --- Long description ---
  const longDescription = [
    broadcastBlock,
    introTemplate,
    storyBlock,
    technicalBlock,
    logBlock,
    closingBlock,
    philosophyBlock,
    supportBlock,
  ]
    .filter(Boolean)
    .join('\n\n');
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
