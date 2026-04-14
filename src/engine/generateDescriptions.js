function toTitleCase(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

export function generateDescriptions(formData) {
  const tagLine = buildTagLine(formData);

  return [
    `Recovered transmission: ${formData.artist} - ${formData.song}. Reconstructed under Signal ${formData.signalNumber}. This version was ${tagLine}.`,
    `Archive log: This take on ${formData.song} by ${formData.artist} was ${tagLine}, shifting the original into a different space.`,
    `Signal reconstruction note: ${formData.song} has been reshaped for this Illegal Mind rework, ${tagLine}.`,
  ];
}
