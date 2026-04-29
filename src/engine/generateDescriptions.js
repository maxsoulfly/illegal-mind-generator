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

function buildTagLine(formData, projectConfig) {
  const excluded = ['nostalgia', '90s', '00s', 'faithful'];

  const tags = (formData.transformationTags || [])
    .filter((tag) => !excluded.includes(tag))
    .map(toTitleCase)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  if (tags.length === 0) {
    const fallback = projectConfig?.descriptionTemplates?.long
      ?.tagLineFallbacks || ['signal reshaped for current conditions'];

    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  const templates = [
    (t) => `reworked into a ${t.toLowerCase()} version`,
    (t) => `reshaped into a ${t.toLowerCase()} form`,
    (t) => `reconstructed into a ${t.toLowerCase()} state`,
    (t) => `pushed toward a ${t.toLowerCase()} direction`,
  ];

  const formatTags = (tags) => {
    if (tags.length === 1) return tags[0];
    if (tags.length === 2) return `${tags[0]} and ${tags[1]}`;
    return `${tags.slice(0, -1).join(', ')} and ${tags[tags.length - 1]}`;
  };

  const selectedTemplate =
    templates[Math.floor(Math.random() * templates.length)];

  return selectedTemplate(formatTags(tags));
}

function buildTagPhrase(formData) {
  const tags = (formData.transformationTags || []).map(toTitleCase);
  if (tags.length === 0) return 'reshaped';
  if (tags.length === 1) return tags[0];
  if (tags.length === 2) return `${tags[0]} and ${tags[1]}`;
  return `${tags.slice(0, -1).join(', ')} and ${tags[tags.length - 1]}`;
}

export function generateDescriptions(formData, projectConfig) {
  const tagLine = buildTagLine(formData, projectConfig);
  const tagPhrase = buildTagPhrase(formData);

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
        .replace(/\{tagLine\}/g, tagPhrase);

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

  const closingCombined = [closingBlock, philosophyBlock]
    .filter(Boolean)
    .join('\n');

  // --- Technical block ---
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

  const logNotes = projectConfig?.descriptionTemplates?.long?.logNotes || [];

  const defaultLogNote =
    logNotes.length > 0
      ? pickRandom(logNotes)
      : projectConfig?.descriptionTemplates?.long?.defaultLogNote ||
        'Signal stabilized.';

  const logNote = formData.customLogNote?.trim()
    ? formData.customLogNote.trim()
    : defaultLogNote;

  const baseLogBlock = logTemplate
    .replace(/\{tagLine\}/g, tagLine)
    .replace(/\{logNote\}/g, logNote);

  const logBlock = [baseLogBlock, tagLogBlock].filter(Boolean).join('\n');

  // --- Short tag phrase ---
  function buildShortTagPhrase(formData) {
    const excluded = ['nostalgia', '90s', '00s'];

    const tags = (formData.transformationTags || [])
      .filter((tag) => !excluded.includes(tag))
      .map(toTitleCase);

    if (tags.length === 0) return 'Rework';

    const shuffled = [...tags].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    if (selected.length === 1) return selected[0];
    if (selected.length === 2) return `${selected[0]} and ${selected[1]}`;

    return 'Rework';
  }

  const shortTagPhrase = buildShortTagPhrase(formData);

  // --- Long description ---
  const longDescription = [
    broadcastBlock,
    introTemplate,
    storyBlock,
    technicalBlock,
    logBlock,
    closingCombined,
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
      .replace(/\{tagLine\}/g, shortTagPhrase),
  );

  return {
    shortDescriptions,
    longDescription,
    fileId,
  };
}
