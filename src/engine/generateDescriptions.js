function toTitleCase(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

  const broadcastTemplate =
    projectConfig?.descriptionTemplates?.long?.broadcastHeader?.[0] ?? '';

  const supportTemplate =
    projectConfig?.descriptionTemplates?.long?.supportBlock?.[0] ?? '';

  const longDescription = [
    broadcastTemplate,
    '',
    replaceLinkPlaceholders(supportTemplate, projectConfig?.links),
  ].join('\n');

  const shortTemplates =
  projectConfig?.descriptionTemplates?.shorts || [];

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
