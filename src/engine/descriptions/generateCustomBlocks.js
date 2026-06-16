function replaceLinkPlaceholders(template, links = {}) {
  return template.replace(/\{links\.(.*?)\}/g, (_, key) => {
    return links?.[key] ?? '';
  });
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

function renderTextTemplate(text, projectConfig, formData, tagLine) {
  return replaceLinkPlaceholders(text, projectConfig.description.links)
    .replace(/\{artist\}/g, formData.artist || '')
    .replace(/\{song\}/g, formData.song || '')
    .replace(/\{tagLine\}/g, tagLine);
}

// Merges the generic per-song block overrides with the legacy customCta/
// customGear fields (which predate songBlockOverrides but target blocks —
// customCtaBlock/gearBlock — that already live in customBlocks).
// songBlockOverrides wins when both are set: customCtaBlock now has a real
// UI field that writes there (useSavedEntries seeds it from legacy customCta
// on load), so a fresh edit there must not be shadowed by a stale legacy
// value. The legacy field is only a fallback for entries that never went
// through that seeding (e.g. customGear, which still has no generic field).
export function getEffectiveSongOverrides(formData) {
  const overrides = { ...(formData.songBlockOverrides || {}) };

  if (!overrides.customCtaBlock && formData.customCta?.trim()) {
    overrides.customCtaBlock = formData.customCta.trim();
  }
  if (!overrides.gearBlock && formData.customGear?.trim()) {
    overrides.gearBlock = formData.customGear.trim();
  }

  return overrides;
}

// songOverride, when non-empty, is a per-song override (typed in the
// generator's Advanced panel) that takes precedence over the block's own
// project-level content, rendered as plain text regardless of the
// original block's shape (List or Text).
export function renderCustomBlock(block, projectConfig, formData, tagLine, songOverride) {
  if (songOverride) {
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

export function generateCustomBlocks(formData, projectConfig, tagLine) {
  const customBlocks =
    projectConfig.description.templates.long.customBlocks || {};
  const songOverrides = getEffectiveSongOverrides(formData);

  const renderedCustomBlocks = Object.fromEntries(
    Object.entries(customBlocks).map(([key, block]) => [
      key,
      renderCustomBlock(block, projectConfig, formData, tagLine, songOverrides[key]?.trim()),
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
