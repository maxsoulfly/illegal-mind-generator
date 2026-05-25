function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

export function generateBroadcastBlock(formData, projectConfig, selectedTags) {
  const tagRegistry = projectConfig?.tags || {};

  const getDescriptionTag = (tag) => tagRegistry[tag]?.description || {};

  const operatorStatuses = projectConfig?.description.operatorStatuses || [];

  const operatorStatus = pickRandom(operatorStatuses) || 'unstable cycle';

  const fileCore =
    (formData.song || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase() || '')
      .join('') || 'SIG';

  const fileId = `${fileCore}-${formData.signalNumber || '00'}`;

  const tagStatusLines = selectedTags.flatMap(
    (tag) => getDescriptionTag(tag).status || [],
  );

  const baseStatusLines =
    projectConfig?.description.templates?.long?.statusLines || [];

  const combinedStatus = [...tagStatusLines, ...baseStatusLines];

  const selectedStatus = [...combinedStatus]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  const statusBlock = selectedStatus.join('\n');

  const broadcastTemplate = pickRandom(
    projectConfig?.description.templates?.long?.broadcastHeader,
  );

  const broadcastHeader = broadcastTemplate
    .replace(/\{fileId\}/g, fileId)
    .replace(/\{operatorStatus\}/g, operatorStatus);

  const broadcastBlock = [broadcastHeader, statusBlock]
    .filter(Boolean)
    .join('\n');

  return {
    broadcastBlock,
    fileId,
  };
}
