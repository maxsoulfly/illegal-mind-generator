import { fillPlaceholders, pickViableTemplate } from '../placeholders';
import { resolvePooledOutput } from '../pooling';
import { findHookBlockByKey, resolveHookBlockTemplates } from '../hookBlockLookup';

function replaceLinkPlaceholders(template, links = {}) {
  return template.replace(/\{links\.(.*?)\}/g, (_, key) => {
    return links?.[key] ?? '';
  });
}

function pickRandomItem(items) {
  return [items[Math.floor(Math.random() * items.length)]];
}

// Returns { text, pickedItem }. pickedItem is only set when displayMode is
// 'random' and an item was actually chosen — 'all' mode has no single winner
// to point a source-navigation feature at, so callers should treat a missing
// pickedItem as "nothing specific to highlight."
// `ctx` ({ formData, projectConfig, tagLine }) fills every item's own
// placeholders via fillPlaceholders — item.link keeps its separate
// replaceLinkPlaceholders pass first (link-specific {links.*} substitution),
// item.text/item.label go through the general resolver like every other
// piece of template text in this file.
export function renderStructuredBlock(block, ctx, links = {}) {
  if (!block || !block.items) return { text: '', pickedItem: undefined };

  const title = block.title ? fillPlaceholders(block.title, ctx).text : '';
  const isRandom = block.displayMode === 'random' && block.items.length > 0;
  const sourceItems = isRandom ? pickRandomItem(block.items) : block.items;

  const items = sourceItems
    .map((item) => {
      const label = item.label ? fillPlaceholders(item.label, ctx).text : '';

      if (item.link) {
        const link = replaceLinkPlaceholders(item.link, links);
        return label ? `${label}: ${link}` : link;
      }

      if (item.text) {
        const text = fillPlaceholders(item.text, ctx).text;
        return label ? `${label}: ${text}` : text;
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

// True when a non-empty song override exists for this block key — mirrors the
// exact truthiness renderCustomBlock/resolveHookOverride already use to decide
// whether to use the override or fall back to the project-level pool. Used by
// resolveBlockSource (descriptionLayout.js) so a description segment's source
// isn't misattributed to the project pool when a song override actually won.
export function isSongOverrideActive(songOverrides, blockKey) {
  const override = songOverrides[blockKey];
  if (Array.isArray(override?.items)) return override.items.length > 0;
  return Boolean(resolveHookOverride(override));
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
      { formData, projectConfig, tagLine },
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
    return renderStructuredBlock(block, { formData, projectConfig, tagLine }, projectConfig.description.links).text;
  }

  if (typeof block.text === 'string') {
    return renderTextTemplate(block.text, projectConfig, formData, tagLine);
  }

  return '';
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
  const block = findHookBlockByKey(hookBlocks, layoutKey);
  if (!block) return null;

  const templates = resolveHookBlockTemplates(layoutKey, ctx.projectConfig);
  if (!templates?.length) return null;

  const maxLines =
    ctx.projectConfig.description?.hookBlockMaxLines?.[block.key] ?? block.countMax ?? 1;
  const configuredCount =
    ctx.projectConfig.description?.hookBlockCounts?.[block.key] ?? block.countDefault ?? 1;
  const count = Math.max(1, Math.min(configuredCount, maxLines, templates.length));

  return resolvePooledOutput(templates, ctx, fillPlaceholders, { count });
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
    { formData, projectConfig, tagLine },
    projectConfig.description.links,
  ).text;

  return {
    renderedCustomBlocks,
    supportBlock,
  };
}

// Resolves a single layout-slot key to its rendered text: an explicit
// pre-computed value in `blocks` (broadcastBlock, introBlock, a sibling
// Block Group's own output once merged in, etc.), else a song override for
// that key, else the hook block pool's random pick. Shared by the top-level
// Long description layout loop (generateDescriptions.js) and
// generateBlockGroups below so the two resolution paths can't drift apart.
export function resolveLayoutKey(key, ctx, blocks, songOverrides) {
  if (key in blocks) return blocks[key];
  const hookSongOverride = resolveHookOverride(songOverrides[key]);
  if (hookSongOverride) {
    return renderTextTemplate(hookSongOverride, ctx.projectConfig, ctx.formData, ctx.tagLine);
  }
  return resolveHookBlockOutput(key, ctx)?.text;
}

// Resolves every configured Block Group to its joined text: each 'block'
// child is resolved through resolveLayoutKey; joined tight with '\n',
// matching the bespoke merges (generateBroadcastBlock.js, generateLogBlock.js,
// the old inline closingBlock join) this type replaces. 'generated' children
// (tag-scoped content) aren't implemented yet — Phase 2. Returns a
// { [group.key]: text } map ready to spread into the `blocks` map.
export function generateBlockGroups(blockGroups, ctx, blocks, songOverrides) {
  return Object.fromEntries(
    blockGroups.map((group) => {
      const parts = group.children
        .filter((child) => child.type === 'block')
        .map((child) => resolveLayoutKey(child.key, ctx, blocks, songOverrides))
        .filter(Boolean);
      return [group.key, parts.join('\n')];
    }),
  );
}

export { pickViableTemplate };
