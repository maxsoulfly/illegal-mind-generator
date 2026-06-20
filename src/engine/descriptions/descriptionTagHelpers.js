function toTitleCase(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function resolveTagLabel(tagKey, projectConfig) {
  const label = projectConfig?.tags?.[tagKey]?.label;
  return label ? toTitleCase(label) : toTitleCase(tagKey.replace(/_/g, ' '));
}

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

export function buildTagLine(formData, projectConfig) {
  const longTemplates = projectConfig?.description.templates?.long || {};

  const excluded = longTemplates.tagLineExcludedTags || [];

  const tags = (formData.transformationTags || [])
    .filter((tag) => !excluded.includes(tag))
    .map((tag) => resolveTagLabel(tag, projectConfig))
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

export function buildTagPhrase(formData, projectConfig) {
  const tags = (formData.transformationTags || []).map((tag) => resolveTagLabel(tag, projectConfig));

  if (tags.length === 0) return 'reshaped';
  if (tags.length === 1) return tags[0];
  if (tags.length === 2) return `${tags[0]} and ${tags[1]}`;

  return `${tags.slice(0, -1).join(', ')} and ${tags[tags.length - 1]}`;
}
