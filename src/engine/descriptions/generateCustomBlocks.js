function replaceLinkPlaceholders(template, links = {}) {
  return template.replace(/\{links\.(.*?)\}/g, (_, key) => {
    return links?.[key] ?? '';
  });
}

export function renderStructuredBlock(block, links = {}) {
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

function renderTextTemplate(text, projectConfig, formData, tagLine) {
  return replaceLinkPlaceholders(text, projectConfig.description.links)
    .replace(/\{artist\}/g, formData.artist || '')
    .replace(/\{song\}/g, formData.song || '')
    .replace(/\{tagLine\}/g, tagLine);
}

// songOverride, when non-empty, is a per-song Text override (typed in the
// generator's Advanced panel) that takes precedence over the block's own
// project-level text — only meaningful for Text blocks (scope: 'song').
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
  const songOverrides = formData.songBlockOverrides || {};

  const renderedCustomBlocks = Object.fromEntries(
    Object.entries(customBlocks).map(([key, block]) => [
      key,
      renderCustomBlock(block, projectConfig, formData, tagLine, songOverrides[key]?.trim()),
    ]),
  );

  const customCtaBlock = formData.customCta?.trim()
    ? formData.customCta.trim()
    : renderedCustomBlocks.customCtaBlock;

  const supportBlockConfig =
    projectConfig.description.templates.long.supportBlock;

  const supportBlock = renderStructuredBlock(
    supportBlockConfig,
    projectConfig.description.links,
  );

  return {
    renderedCustomBlocks,
    customCtaBlock,
    supportBlock,
  };
}
