import { fillPlaceholders, pickViableTemplate } from '../placeholders';

function replaceLinkPlaceholders(template, links = {}) {
  return template.replace(/\{links\.(.*?)\}/g, (_, key) => {
    return links?.[key] ?? '';
  });
}

function pickRandomItem(items) {
  return [items[Math.floor(Math.random() * items.length)]];
}

// Picks up to `count` random, non-repeating lines from a pool (order not
// preserved). Shared by every hook block that can output more than one line
// per generation, so "randomly chosen" means the same thing everywhere.
export function pickRandomLines(pool = [], count = 1) {
  return [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.max(0, count));
}

// Returns { text, pickedItem }. pickedItem is only set when displayMode is
// 'random' and an item was actually chosen — 'all' mode has no single winner
// to point a source-navigation feature at, so callers should treat a missing
// pickedItem as "nothing specific to highlight."
export function renderStructuredBlock(block, links = {}) {
  if (!block || !block.items) return { text: '', pickedItem: undefined };

  const title = block.title || '';
  const isRandom = block.displayMode === 'random' && block.items.length > 0;
  const sourceItems = isRandom ? pickRandomItem(block.items) : block.items;

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

  const text = [title, items].filter(Boolean).join('\n');

  return { text, pickedItem: isRandom ? sourceItems[0] : undefined };
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

export function renderTextTemplate(text, projectConfig, formData, tagLine) {
  return fillPlaceholders(text, { formData, projectConfig, tagLine }).text;
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
    ).text;
  }

  if (songOverride && typeof songOverride === 'string' && songOverride.trim()) {
    return renderTextTemplate(songOverride, projectConfig, formData, tagLine);
  }

  if (typeof block === 'string') {
    return renderTextTemplate(block, projectConfig, formData, tagLine);
  }

  if (typeof block !== 'object' || !block) return '';

  if (Array.isArray(block.items)) {
    return renderStructuredBlock(block, projectConfig.description.links).text;
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

// Resolves a hook block identified by its layout key to its final rendered
// output: 1+ randomly-picked lines (count comes from hookBlockCounts, capped
// by hookBlockMaxLines/countMax), fully placeholder-filled and joined with
// newlines. Candidates whose placeholders would render empty (e.g. {tags.genre}
// with no genre-category tag selected) are excluded before picking. Returns
// null if the key doesn't match any hook block entry, or if every candidate
// would be empty — either way, callers treat null as "nothing to show".
// `template` on the returned object is the winning template's raw text (only
// meaningful when exactly one line was picked — with multiple lines there's
// no single "the" winner, so it's left undefined for callers to skip).
export function resolveHookBlockOutput(layoutKey, ctx) {
  const hookBlocks = ctx.projectConfig.description?.hookBlocks || [];
  const block = hookBlocks.find(
    (b) => (b.descriptionLayoutKey ?? b.key) === layoutKey,
  );
  if (!block) return null;

  const templates = resolveHookBlockTemplates(layoutKey, ctx.projectConfig);
  if (!templates?.length) return null;

  const maxLines =
    ctx.projectConfig.description?.hookBlockMaxLines?.[block.key] ?? block.countMax ?? 1;
  const configuredCount =
    ctx.projectConfig.description?.hookBlockCounts?.[block.key] ?? block.countDefault ?? 1;
  const count = Math.max(1, Math.min(configuredCount, maxLines, templates.length));

  const resolved = templates.map((template) => ({ template, ...fillPlaceholders(template, ctx) }));
  const viable = resolved.filter((r) => !r.hasEmpty);
  if (viable.length === 0) return null;

  const picked = pickRandomLines(viable, Math.min(count, viable.length));

  return {
    text: picked.map((r) => r.text).join('\n'),
    template: picked.length === 1 ? picked[0].template : undefined,
  };
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
  ).text;

  return {
    renderedCustomBlocks,
    supportBlock,
  };
}

export { pickViableTemplate };
