import { generateShortDescriptions } from './generateShortDescriptions';
import { generateBroadcastBlock } from './generateBroadcastBlock';
import { generateTechnicalBlock } from './generateTechnicalBlock';
import { generateLogBlock } from './generateLogBlock';
import { generateCustomBlocks } from './generateCustomBlocks';
import { buildTagLine, buildTagPhrase } from './descriptionTagHelpers';

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
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

  // --- Log block ---
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
  const { renderedCustomBlocks, supportBlock } =
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
