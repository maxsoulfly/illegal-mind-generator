function replaceLinkPlaceholders(template, links = {}) {
  return template.replace(/\{links\.(.*?)\}/g, (_, key) => {
    return links?.[key] ?? '';
  });
}

function pickOneGenre(str) {
  if (!str) return '';
  const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
  return parts[Math.floor(Math.random() * parts.length)] || '';
}

function pickRandomItem(items) {
  return [items[Math.floor(Math.random() * items.length)]];
}

export function renderStructuredBlock(block, links = {}) {
  if (!block || !block.items) return '';

  const title = block.title || '';
  const sourceItems =
    block.displayMode === 'random' && block.items.length > 0
      ? pickRandomItem(block.items)
      : block.items;

  const items = sourceItems
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

// Resolves a song override that may be a string (textarea) or string[] (list).
// Returns the resolved string, or null if no usable override is present.
export function resolveHookOverride(override) {
  if (Array.isArray(override)) {
    const options = override.filter((s) => typeof s === 'string' && s.trim());
    if (!options.length) return null;
    return options[Math.floor(Math.random() * options.length)].trim();
  }
  if (typeof override === 'string' && override.trim()) return override.trim();
  return null;
}

// Resolves {transformation}: picks a random project-level template (or per-song
// override) and substitutes basic placeholders. Used as a value by
// renderTextTemplate and fillHookTemplate — NOT called recursively.
export function resolveTransformation(formData, projectConfig, tagLine = '') {
  const ptConfig = projectConfig?.title?.primaryTag || {};
  const count = Math.max(1, ptConfig.count || 1);
  const order = ptConfig.order || 'selection';
  const separator = ptConfig.separator ?? ' & ';
  const tags = formData.transformationTags || [];
  const pool = order === 'random' ? [...tags].sort(() => Math.random() - 0.5) : [...tags];
  const primaryTag = pool.slice(0, count).join(separator) || '';

  const overrides = formData.songBlockOverrides || {};
  const override = resolveHookOverride(overrides.transformation);
  const templates = projectConfig?.description?.templates?.long?.transformationBlock || [];
  const template = override || templates[Math.floor(Math.random() * templates.length)] || '';

  return template
    .replace(/\{primaryTag\}/g, primaryTag)
    .replace(/\{artist\}/g, formData.artist || '')
    .replace(/\{song\}/g, formData.song || '')
    .replace(/\{year\}/g, formData.originalYear || '')
    .replace(/\{originalGenre\}/g, pickOneGenre(formData.originalGenre))
    .replace(/\{tagLine\}/g, tagLine);
}

export function renderTextTemplate(text, projectConfig, formData, tagLine) {
  const transformation = resolveTransformation(formData, projectConfig, tagLine);
  return replaceLinkPlaceholders(text, projectConfig.description.links)
    .replace(/\{artist\}/g, formData.artist || '')
    .replace(/\{song\}/g, formData.song || '')
    .replace(/\{year\}/g, formData.originalYear || '')
    .replace(/\{originalGenre\}/g, pickOneGenre(formData.originalGenre))
    .replace(/\{tagLine\}/g, tagLine)
    .replace(/\{transformation\}/g, transformation);
}

// Merges the generic per-song block overrides with the legacy customCta
// field (which predates songBlockOverrides but targets customCtaBlock).
// songBlockOverrides wins when both are set: customCtaBlock now has a real
// UI field that writes there (useSavedEntries seeds it from legacy customCta
// on load), so a fresh edit there must not be shadowed by a stale legacy value.
export function getEffectiveSongOverrides(formData) {
  const overrides = { ...(formData.songBlockOverrides || {}) };

  if (!overrides.customCtaBlock && formData.customCta?.trim()) {
    overrides.customCtaBlock = formData.customCta.trim();
  }
  if (!overrides.storyBlock && formData.customStory?.trim()) {
    overrides.storyBlock = formData.customStory.trim();
  }
  if (!overrides.logBlock && formData.customLogNote?.trim()) {
    overrides.logBlock = formData.customLogNote.trim();
  }

  return overrides;
}

// songOverride, when present, takes precedence over the block's project-level
// content. String overrides (Text blocks) render as plain text; object
// overrides with an items array (List blocks) render as a structured block
// using the project-level block's title and displayMode.
export function renderCustomBlock(block, projectConfig, formData, tagLine, songOverride) {
  if (songOverride && typeof songOverride === 'object' && Array.isArray(songOverride.items)) {
    return renderStructuredBlock(
      { ...block, items: songOverride.items },
      projectConfig.description.links,
    );
  }

  if (songOverride && typeof songOverride === 'string' && songOverride.trim()) {
    return renderTextTemplate(songOverride, projectConfig, formData, tagLine);
  }

  if (typeof block === 'string') {
    return renderTextTemplate(block, projectConfig, formData, tagLine);
  }

  if (typeof block !== 'object' || !block) return '';

  if (Array.isArray(block.items)) {
    return renderStructuredBlock(block, projectConfig.description.links);
  }

  if (typeof block.text === 'string') {
    return renderTextTemplate(block.text, projectConfig, formData, tagLine);
  }

  return '';
}

// Returns the templates array for a hook block identified by its layout key,
// or null if the key doesn't match any hook block entry.
export function resolveHookBlockTemplates(layoutKey, projectConfig) {
  const hookBlocks = projectConfig.description?.hookBlocks || [];
  const block = hookBlocks.find(
    (b) => (b.descriptionLayoutKey ?? b.key) === layoutKey,
  );
  if (!block) return null;

  const { path, templateKey } = block;
  const long = projectConfig.description?.templates?.long || {};
  const shorts = projectConfig.description?.templates?.shorts || {};
  const desc = projectConfig.description || {};

  if (path === 'long') return long[templateKey] || [];
  if (path === 'top') return desc[templateKey] || [];
  if (path === 'shorts') return shorts[templateKey] || [];
  return [];
}

export function generateCustomBlocks(formData, projectConfig, tagLine) {
  const customBlocks =
    projectConfig.description.templates.long.customBlocks || {};
  const songOverrides = getEffectiveSongOverrides(formData);

  const renderedCustomBlocks = Object.fromEntries(
    Object.entries(customBlocks).map(([key, block]) => [
      key,
      renderCustomBlock(block, projectConfig, formData, tagLine, songOverrides[key]),
    ]),
  );

  const supportBlockConfig =
    projectConfig.description.templates.long.supportBlock;

  const supportBlock = renderStructuredBlock(
    supportBlockConfig,
    projectConfig.description.links,
  );

  return {
    renderedCustomBlocks,
    supportBlock,
  };
}
