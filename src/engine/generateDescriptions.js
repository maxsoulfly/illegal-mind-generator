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
  const longTemplates = projectConfig?.description.templates?.long || {};

  const excluded = longTemplates.tagLineExcludedTags || [];

  const tags = (formData.transformationTags || [])
    .filter((tag) => !excluded.includes(tag))
    .map(toTitleCase)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  if (tags.length === 0) {
    const fallback = longTemplates.tagLineFallbacks || [];
    return fallback.length > 0 ? pickRandom(fallback) : '';
  }

  const templates = longTemplates.tagLineTemplates || ['{tags}'];

  const formatTags = (tags) => {
    if (tags.length === 1) return tags[0];
    if (tags.length === 2) return `${tags[0]} and ${tags[1]}`;
    return `${tags.slice(0, -1).join(', ')} and ${tags[tags.length - 1]}`;
  };

  const selectedTemplate = pickRandom(templates);

  return selectedTemplate.replace(/\{tags\}/g, formatTags(tags).toLowerCase());
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
  const operatorStatuses = projectConfig?.description.operatorStatuses || [];

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
  const introBlock = pickRandom(
    projectConfig?.description.templates?.long?.introHook,
  );

  // --- Status block ---
  const selectedTags = formData.transformationTags || [];
  const descriptionTagMap = projectConfig?.description.tagMap || {};

  // collect tag-based status lines
  const tagStatusLines = selectedTags.flatMap(
    (tag) => descriptionTagMap[tag]?.status || [],
  );

  // fallback to global status lines
  const baseStatusLines =
    projectConfig?.description.templates?.long?.statusLines || [];

  // merge (tag lines first)
  const combinedStatus = [...tagStatusLines, ...baseStatusLines];

  // pick 2
  const selectedStatus = [...combinedStatus]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  const statusBlock = selectedStatus.join('\n');

  // --- Broadcast block ---

  const broadcastTemplate = pickRandom(
    projectConfig?.description.templates?.long?.broadcastHeader,
  );
  const broadcastHeader = broadcastTemplate
    .replace(/\{fileId\}/g, fileId)
    .replace(/\{operatorStatus\}/g, operatorStatus);

  const broadcastBlock = [broadcastHeader, statusBlock]
    .filter(Boolean)
    .join('\n');

  // --- Story block ---
  const storyTemplate = pickRandom(
    projectConfig?.description.templates?.long?.storyBlock,
  );

  const storyBlock = formData.customStory?.trim()
    ? formData.customStory.trim()
    : storyTemplate
        .replace(/\{artist\}/g, formData.artist || '')
        .replace(/\{song\}/g, formData.song || '')
        .replace(/\{tagLine\}/g, tagPhrase);

  // --- Support block ---
  const supportTemplate =
    projectConfig?.description.templates?.long?.supportBlock?.[0] ?? '';

  const supportBlock = replaceLinkPlaceholders(
    supportTemplate,
    projectConfig?.description.links || {},
  );

  // --- Philosophy block ---
  const philosophyTemplate = pickRandom(
    projectConfig?.description.templates?.long?.philosophyLine,
  );

  const philosophyBlock = philosophyTemplate;

  // --- Closing block ---
  const closingTemplate = pickRandom(
    projectConfig?.description.templates?.long?.closingSignal,
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
    projectConfig?.description.templates?.long?.logBlock,
  );

  const logNotes = projectConfig?.description.templates?.long?.logNotes || [];

  const defaultLogNote =
    logNotes.length > 0
      ? pickRandom(logNotes)
      : projectConfig?.description.templates?.long?.defaultLogNote ||
        'Signal stabilized.';

  const logNote = formData.customLogNote?.trim()
    ? formData.customLogNote.trim()
    : defaultLogNote;

  const baseLogBlock = logTemplate
    .replace(/\{tagLine\}/g, tagLine)
    .replace(/\{logNote\}/g, logNote);

  const logBlock = [baseLogBlock, tagLogBlock].filter(Boolean).join('\n');

  // --- Short tag phrase ---
  function buildShortTagPhrase(formData, projectConfig) {
    const shortTagConfig =
      projectConfig?.description.templates?.long?.shortTagPhrase || {};
    const excluded = shortTagConfig.excludedTags || [];

    const maxTags = shortTagConfig.maxTags || 2;
    const joinWord = shortTagConfig.joinWord || 'and';
    const fallback = shortTagConfig.fallback || '';

    const tags = (formData.transformationTags || [])
      .filter((tag) => !excluded.includes(tag))
      .map(toTitleCase);

    if (tags.length === 0) return fallback;

    const shuffled = [...tags].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, maxTags);

    if (selected.length === 1) return selected[0];
    if (selected.length >= 2) {
      return `${selected.slice(0, -1).join(', ')} ${joinWord} ${
        selected[selected.length - 1]
      }`;
    }

    return fallback;
  }

  // --- Long description ---
  if (!projectConfig?.description.templates?.long?.layout) {
    throw new Error('Missing description layout in project config');
  }

  const layout = projectConfig.description.templates.long.layout;
  const blocks = {
    broadcastBlock,
    introBlock,
    storyBlock,
    technicalBlock,
    logBlock,
    closingBlock: closingCombined,
    supportBlock,
  };

  const longDescription = layout
    .map((blockName) => blocks[blockName])
    .filter(Boolean)
    .join('\n\n');

  // --- Shorts ---
  const shortsConfig = projectConfig.description.templates.shorts;
  const count = shortsConfig.count || 3;

  const headers = shortsConfig.header || [];
  const primary = shortsConfig.primary || [];
  const secondary = shortsConfig.secondary || [];

  const shortTagPhrase = buildShortTagPhrase(formData, projectConfig);

  const shortDescriptions = [];

  for (let i = 0; i < count; i++) {
    const header = pickRandom(headers);
    const line1 = pickRandom(primary);
    const line2 = pickRandom(secondary);

    const text = [header, line1, line2]
      .filter(Boolean)
      .join('\n')
      .replace(/\{num\}/g, formData.signalNumber || '00')
      .replace(/\{artist\}/g, formData.artist || '')
      .replace(/\{song\}/g, formData.song || '')
      .replace(/\{tagLine\}/g, shortTagPhrase);

    shortDescriptions.push(text);
  }

  return {
    shortDescriptions,
    longDescription,
    fileId,
  };
}
