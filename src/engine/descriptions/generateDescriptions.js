import { generateShortDescriptions } from './generateShortDescriptions';
import { generateBroadcastBlock } from './generateBroadcastBlock';
import { generateTechnicalBlock } from './generateTechnicalBlock';
import { generateLogBlock } from './generateLogBlock';
import { generateCustomBlocks } from './generateCustomBlocks';

function toTitleCase(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
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

export function generateDescriptions(formData, projectConfig, shortHooks = []) {
  const tagLine = buildTagLine(formData, projectConfig);
  const tagPhrase = buildTagPhrase(formData);
  const selectedTags = formData.transformationTags || [];

  // --- Broadcast block ---
  const { broadcastBlock, fileId } = generateBroadcastBlock(
    formData,
    projectConfig,
    selectedTags,
  );

  // --- Intro block ---
  const introBlock = pickRandom(
    projectConfig?.description.templates?.long?.introHook,
  );

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
  const technicalBlock = generateTechnicalBlock(selectedTags, projectConfig);

  // --- Story block ---
  const logBlock = generateLogBlock(
    selectedTags,
    projectConfig,
    formData,
    tagLine,
  );

  // --- Long description ---
  if (!projectConfig?.description.templates?.long?.layout) {
    throw new Error('Missing description layout in project config');
  }

  // --- Custom blocks ---
  const { renderedCustomBlocks, customCtaBlock, supportBlock } =
    generateCustomBlocks(formData, projectConfig, tagLine);

  const layout = projectConfig.description.templates.long.layout;
  const blocks = {
    broadcastBlock,
    introBlock,
    storyBlock,
    technicalBlock,
    logBlock,
    closingBlock: closingCombined,
    supportBlock,
    ...renderedCustomBlocks,
    customCtaBlock,
  };

  const longDescription = layout
    .map((blockName) => blocks[blockName])
    .filter(Boolean)
    .join('\n\n');

  // --- Shorts ---
  const shortDescriptions = generateShortDescriptions(
    formData,
    projectConfig,
    shortHooks,
    tagPhrase,
  );

  return {
    shortDescriptions,
    longDescription,
    fileId,
  };
}
