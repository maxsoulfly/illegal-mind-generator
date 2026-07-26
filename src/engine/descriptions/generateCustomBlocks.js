import { fillPlaceholders, freezeTemplate, renderFrozenTemplate, fillPlaceholdersAndFreeze, fillFrozenPlaceholders, pickViableTemplate, pickViableTemplateFrozen, renderViableTemplateFrozen } from '../placeholders';
import { pickPooledTemplates, renderPooledTemplates } from '../pooling';
import { findHookBlockByKey, resolveHookBlockTemplates } from '../hookBlockLookup';

function replaceLinkPlaceholders(template, links = {}) {
  return template.replace(/\{links\.(.*?)\}/g, (_, key) => {
    return links?.[key] ?? '';
  });
}

function pickRandomIndex(length) {
  return Math.floor(Math.random() * length);
}

// PICK phase for a structured (List) block: decides which item(s) are shown
// — every item in 'all' mode (deterministic, nothing to freeze there), or
// one randomly-picked item in 'random' mode (frozen — which one won) — and
// freezes each shown item's own placeholder resolution (title/label/text can
// all reference random tokens like {tags.*}). `ctx` is the pick-time ctx.
export function pickStructuredBlock(block, ctx) {
  if (!block || !block.items) return null;

  const isRandom = block.displayMode === 'random' && block.items.length > 0;
  const pickedIndex = isRandom ? pickRandomIndex(block.items.length) : undefined;
  const sourceItems = isRandom ? [block.items[pickedIndex]] : block.items;

  return {
    titleFrozen: block.title ? freezeTemplate(block.title, ctx) : null,
    items: sourceItems.map((item) => ({
      item,
      labelFrozen: item.label ? freezeTemplate(item.label, ctx) : null,
      textFrozen: item.text ? freezeTemplate(item.text, ctx) : null,
    })),
    pickedItem: isRandom ? sourceItems[0] : undefined,
  };
}

// RENDER phase: pure substitution of a pickStructuredBlock result against
// live ctx — no randomness, safe to re-run on every relevant form edit.
export function renderStructuredBlockFromPicked(picked, ctx, links = {}) {
  if (!picked) return { text: '', pickedItem: undefined };

  const title = picked.titleFrozen ? renderFrozenTemplate(picked.titleFrozen, ctx).text : '';

  const itemLines = picked.items
    .map(({ item, labelFrozen, textFrozen }) => {
      const label = labelFrozen ? renderFrozenTemplate(labelFrozen, ctx).text : '';

      if (item.link) {
        const link = replaceLinkPlaceholders(item.link, links);
        return label ? `${label}: ${link}` : link;
      }

      if (textFrozen) {
        const text = renderFrozenTemplate(textFrozen, ctx).text;
        return label ? `${label}: ${text}` : text;
      }

      return '';
    })
    .filter(Boolean)
    .join('\n');

  const text = [title, itemLines].filter(Boolean).join('\n');

  return { text, pickedItem: picked.pickedItem };
}

// Back-compat, fully live (pick + render in one call, no freezing) — used
// directly for song-override-shaped lists, where there's no prior frozen
// pick to replay (the override is itself live, user-edited data — see
// renderCustomBlock below) and for any caller that doesn't need the split.
// Known, accepted limitation: if the *project* block's displayMode is
// 'random' and a List-shaped song override is active, this re-picks one
// random override item on every render, since a live override has nothing
// to freeze against — a narrow combination, not part of the common case.
export function renderStructuredBlock(block, ctx, links = {}) {
  return renderStructuredBlockFromPicked(pickStructuredBlock(block, ctx), ctx, links);
}

// Resolves a song override that may be a string (textarea) or string[] (list).
// Returns the resolved string, or null if no usable override is present.
// Live by design — reads whatever songOverrides holds *right now*, so an
// edit or a cleared field reflects immediately (see renderCustomBlock).
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

// PICK phase for a customBlocks entry (Text or List): freezes the block's
// own project-default content. Deliberately ignores any song override —
// overrides are resolved live at render time (renderCustomBlock), which is
// what lets typing/clearing one reflect immediately without a re-pick.
export function pickCustomBlockDefault(block, ctx) {
  if (typeof block === 'string') return { kind: 'text', frozen: freezeTemplate(block, ctx) };
  if (typeof block !== 'object' || !block) return { kind: 'empty' };
  if (Array.isArray(block.items)) return { kind: 'list', picked: pickStructuredBlock(block, ctx), block };
  if (typeof block.text === 'string') return { kind: 'text', frozen: freezeTemplate(block.text, ctx) };
  return { kind: 'empty' };
}

function renderCustomBlockDefault(picked, ctx, links) {
  if (picked.kind === 'list') return renderStructuredBlockFromPicked(picked.picked, ctx, links).text;
  if (picked.kind === 'text') return renderFrozenTemplate(picked.frozen, ctx).text;
  return '';
}

// RENDER phase: live-checks for a song override on every call (string,
// string[], or { items: [...] }) before falling back to the frozen
// project-default pick — this is the mechanism that makes editing or
// clearing a Story/Log/CTA/custom-block override reflect immediately.
export function renderCustomBlock(picked, ctx, links, songOverride) {
  if (songOverride && typeof songOverride === 'object' && Array.isArray(songOverride.items)) {
    const overrideBlock = { ...(picked.block || {}), items: songOverride.items };
    return renderStructuredBlock(overrideBlock, ctx, links).text;
  }

  if (songOverride && typeof songOverride === 'string' && songOverride.trim()) {
    return fillPlaceholders(songOverride, ctx).text;
  }

  return renderCustomBlockDefault(picked, ctx, links);
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

// PICK phase: freezes which templates win for a hook block identified by its
// layout key — 1+ randomly-picked lines (count comes from hookBlockCounts,
// capped by hookBlockMaxLines/countMax), each with its own frozen token map.
// Candidates whose placeholders would render empty (e.g. {tags.genre} with no
// genre-category tag selected) are excluded before picking. Returns null if
// the key doesn't match any hook block entry, or if every candidate would be
// empty — either way, callers treat null as "nothing to show".
export function pickHookBlockOutput(layoutKey, ctx) {
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

  const picked = pickPooledTemplates(templates, ctx, fillPlaceholdersAndFreeze, { count });

  return picked.length ? picked : null;
}

// RENDER phase: pure substitution against live ctx — no randomness. `template`
// on the result is the winning template's raw text (only meaningful when
// exactly one line was picked, matching resolvePooledOutput's precedent).
export function renderHookBlockOutput(picked, ctx) {
  if (!picked) return null;
  return renderPooledTemplates(picked, ctx, fillFrozenPlaceholders);
}

// Back-compat convenience: pick + render a hook block output in one call.
export function resolveHookBlockOutput(layoutKey, ctx) {
  return renderHookBlockOutput(pickHookBlockOutput(layoutKey, ctx), ctx);
}

// PICK phase for every customBlocks entry + the support block, in one call.
export function pickCustomBlocks(formData, projectConfig, ctx) {
  const customBlocks = projectConfig.description.templates.long.customBlocks || {};

  const customBlocksPicked = Object.fromEntries(
    Object.entries(customBlocks).map(([key, block]) => [key, pickCustomBlockDefault(block, ctx)]),
  );

  const supportBlockConfig = projectConfig.description.templates.long.supportBlock;
  const supportBlockPicked = pickStructuredBlock(supportBlockConfig, ctx);

  return { customBlocksPicked, supportBlockPicked };
}

// RENDER phase: live-checks every customBlocks entry's song override, falls
// back to each one's frozen project-default pick otherwise.
export function renderCustomBlocks(picked, ctx, songOverrides) {
  const links = ctx.projectConfig.description.links;

  const renderedCustomBlocks = Object.fromEntries(
    Object.entries(picked.customBlocksPicked).map(([key, blockPicked]) => [
      key,
      renderCustomBlock(blockPicked, ctx, links, songOverrides[key]),
    ]),
  );

  const supportBlock = renderStructuredBlockFromPicked(picked.supportBlockPicked, ctx, links).text;

  return { renderedCustomBlocks, supportBlock };
}

// Back-compat convenience: pick + render customBlocks/supportBlock together.
export function generateCustomBlocks(formData, projectConfig, tagLine) {
  const ctx = { formData, projectConfig, tagLine };
  return renderCustomBlocks(pickCustomBlocks(formData, projectConfig, ctx), ctx, getEffectiveSongOverrides(formData));
}

// Every key that might be a "pure hook block" layout slot needs its pool pick
// frozen up front — the top-level layout array plus every Block Group child
// key. (Keys that turn out to already be in `blocks` — introBlock, custom
// blocks, group outputs, etc. — are simply never looked up; computing a
// pick for them too is harmless, just unused.) See generateDescriptions.js.
export function pickLayoutHookBlocks(keys, ctx) {
  return Object.fromEntries([...new Set(keys)].map((key) => [key, pickHookBlockOutput(key, ctx)]));
}

// Resolves a single layout-slot key to its rendered text: an explicit
// already-live-rendered value in `blocks` (broadcastBlock, introBlock, a
// sibling Block Group's own output once merged in, etc. — each of those
// already resolved its own song override live, see renderCustomBlocks/
// generateDescriptions.js), else a live song override for this key, else the
// frozen hook-block pool pick from pickLayoutHookBlocks. Shared by the
// top-level Long description layout loop (generateDescriptions.js) and
// renderBlockGroups below so the two resolution paths can't drift apart.
export function renderLayoutKey(key, ctx, blocks, songOverrides, pickedHookBlocks) {
  if (key in blocks) return blocks[key];
  const hookSongOverride = resolveHookOverride(songOverrides[key]);
  if (hookSongOverride) {
    return renderTextTemplate(hookSongOverride, ctx.projectConfig, ctx.formData, ctx.tagLine);
  }
  return renderHookBlockOutput(pickedHookBlocks[key], ctx)?.text;
}

// Back-compat convenience matching the pre-split signature/behavior exactly
// (pick + render in one call — no freezing carried across calls). Used by
// any caller that hasn't been migrated to the frozen pick/render split.
export function resolveLayoutKey(key, ctx, blocks, songOverrides) {
  if (key in blocks) return blocks[key];
  const hookSongOverride = resolveHookOverride(songOverrides[key]);
  if (hookSongOverride) {
    return renderTextTemplate(hookSongOverride, ctx.projectConfig, ctx.formData, ctx.tagLine);
  }
  return resolveHookBlockOutput(key, ctx)?.text;
}

// Resolves every configured Block Group to its joined text: each 'block'
// child is resolved through renderLayoutKey; joined tight with '\n',
// matching the bespoke merges (the old inline closingBlock join, and the old
// generateBroadcastBlock.js/generateLogBlock.js) this type replaces. Tag-
// scoped content (the per-tag "Modification: ..." log line, per-tag status
// lines) is a Custom Placeholder (src/engine/placeholders.js's
// resolveCustomPlaceholder) wrapped in its own trivial single-template Hook
// Block (e.g. a block whose only template is "{custom.tagLogLine}") and
// added as an ordinary 'block' child — no dedicated 'generated' child type
// was needed after all; a Group of two Hook Blocks already does this
// correctly as long as neither child's template also depends on the other
// (see Log Notes/Broadcast Block in projects.json for the pattern).
//
// groupCtxOverrides (optional, keyed by group.key) lets one specific group
// resolve its children against a different ctx than the shared one every
// other group uses — Log Notes needs this because its wrapper references
// {tagLine}, which must resolve via buildTagLine's result, not buildTagPhrase's
// (the two are genuinely different values — see generateDescriptions.js).
export function renderBlockGroups(blockGroups, ctx, blocks, songOverrides, pickedHookBlocks, groupCtxOverrides = {}) {
  return Object.fromEntries(
    blockGroups.map((group) => {
      const groupCtx = groupCtxOverrides[group.key] ?? ctx;
      const parts = group.children
        .filter((child) => child.type === 'block')
        .map((child) => renderLayoutKey(child.key, groupCtx, blocks, songOverrides, pickedHookBlocks))
        .filter(Boolean);
      return [group.key, parts.join('\n')];
    }),
  );
}

// Back-compat convenience matching the pre-split signature/behavior exactly.
export function generateBlockGroups(blockGroups, ctx, blocks, songOverrides, groupCtxOverrides = {}) {
  return Object.fromEntries(
    blockGroups.map((group) => {
      const groupCtx = groupCtxOverrides[group.key] ?? ctx;
      const parts = group.children
        .filter((child) => child.type === 'block')
        .map((child) => resolveLayoutKey(child.key, groupCtx, blocks, songOverrides))
        .filter(Boolean);
      return [group.key, parts.join('\n')];
    }),
  );
}

export { pickViableTemplate, pickViableTemplateFrozen, renderViableTemplateFrozen };
