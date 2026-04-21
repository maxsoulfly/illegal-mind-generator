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
  const signalNumber = formData.signalNumber || '00';

  return {
    shortDescriptions: [
      `[SIGNAL_${signalNumber} // FILE_${signalNumber}]
▓█ ${formData.artist} - ${formData.song}
⚠️ ${tagLine}. Full pulse active in main broadcast.`,

      `/// DEFIANCE LOOP_${signalNumber}
${formData.song} by ${formData.artist} — ${tagLine}.
☣️ Continue to central feed for full transmission.`,

      `/// WSTLD_SESSION_${signalNumber}
Drive preserved. Energy uncompromised.
${formData.artist} - ${formData.song} — ${tagLine}.`,

      `[ARCHIVE TRACE // ${signalNumber}]
Layered vocals like armor. Drums reinforced.
${formData.song} — ${tagLine}.`,

      `/// FREQUENCY HOLD_${signalNumber}
Sometimes resistance isn’t louder — it’s longer.
${formData.artist} - ${formData.song} — ${tagLine}.`,
    ],
    longDescription,
  };
}
