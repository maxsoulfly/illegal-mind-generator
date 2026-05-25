import { generateShortDescriptions } from './generateShortDescriptions';
import { generateBroadcastBlock } from './generateBroadcastBlock';
import { generateTechnicalBlock } from './generateTechnicalBlock';
import { generateLogBlock } from './generateLogBlock';

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

  // --- Support block ---
  function renderStructuredBlock(block, links = {}) {
    if (!block || !block.items) return '';

    const title = block.title || '';

    const items = block.items
      .map((item) => {
        if (item.link) {
          const link = replaceLinkPlaceholders(item.link, links);
          return item.label ? `${item.label}: ${link}` : link;
        }

        if (item.text) {
          return item.label ? `${item.label}: ${item.text}` : item.text;
        }

        return '';
      })
      .filter(Boolean)
      .join('\n');

    return [title, items].filter(Boolean).join('\n');
  }
  const supportBlockConfig =
    projectConfig.description.templates.long.supportBlock;

  const supportBlock = renderStructuredBlock(
    supportBlockConfig,
    projectConfig.description.links,
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
  const technicalBlock = generateTechnicalBlock(selectedTags, projectConfig);

  // --- Story block ---
  const logBlock = generateLogBlock(
    selectedTags,
    projectConfig,
    formData,
    tagLine,
  );

  // --- Short tag phrase ---

  // --- Long description ---
  if (!projectConfig?.description.templates?.long?.layout) {
    throw new Error('Missing description layout in project config');
  }

  // --- Custom blocks ---

  const customBlocks =
    projectConfig.description.templates.long.customBlocks || {};

  function renderTextTemplate(text, projectConfig, formData, tagLine) {
    return replaceLinkPlaceholders(text, projectConfig.description.links)
      .replace(/\{artist\}/g, formData.artist || '')
      .replace(/\{song\}/g, formData.song || '')
      .replace(/\{tagLine\}/g, tagLine);
  }

  function renderCustomBlock(block, projectConfig, formData, tagLine) {
    if (typeof block === 'string') {
      return renderTextTemplate(block, projectConfig, formData, tagLine);
    }

    if (typeof block === 'object') {
      return renderStructuredBlock(block, projectConfig.description.links);
    }

    return '';
  }
  const renderedCustomBlocks = Object.fromEntries(
    Object.entries(customBlocks).map(([key, block]) => [
      key,
      renderCustomBlock(block, projectConfig, formData, tagLine),
    ]),
  );

  const customCtaBlock = formData.customCta?.trim()
    ? formData.customCta.trim()
    : renderedCustomBlocks.customCtaBlock;

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
