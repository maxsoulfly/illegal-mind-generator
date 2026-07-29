import { fillPlaceholdersAndFreeze, fillFrozenPlaceholders } from '../placeholders';
import { pickPooledTemplates, renderPooledTemplates } from '../pooling';
import { findHookBlockByKey, resolveHookBlockTemplates } from '../hookBlockLookup';
import { resolveHookOverride, renderTextTemplate } from './generateCustomBlocks';

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
