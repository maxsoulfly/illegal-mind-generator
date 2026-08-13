import { resolveTagCategoryValue } from './descriptions/descriptionTagHelpers';
import { resolveHookBlockTemplates } from './hookBlockLookup';
import { resolvePooledOutput } from './pooling';
import { getEligibleShortHookTypeEntries } from './hooks/shortHookEligibility';

const DEFAULT_YEARS = 'a few';

function resolveDecade(transformationTags = []) {
  if (transformationTags.includes('10s')) return '10s';
  if (transformationTags.includes('00s')) return '2000s';
  if (transformationTags.includes('90s')) return '90s';
  if (transformationTags.includes('80s')) return '80s';
  if (transformationTags.includes('70s')) return '70s';
  if (transformationTags.includes('60s')) return '60s';
  return 'Classic';
}

function resolvePrimaryTagValue(transformationTags = [], ptConfig = {}) {
  const count = Math.max(1, ptConfig.count || 1);
  const order = ptConfig.order || 'selection';
  const separator = ptConfig.separator ?? ' & ';
  const pool = order === 'random' ? [...transformationTags].sort(() => Math.random() - 0.5) : [...transformationTags];
  return pool.slice(0, count).join(separator) || '';
}

function splitGenreParts(str) {
  if (!str) return [];
  return str.split(',').map((s) => s.trim()).filter(Boolean);
}

function pickOneGenre(str) {
  const parts = splitGenreParts(str);
  return parts[Math.floor(Math.random() * parts.length)] || '';
}

// For callers whose selection is frozen and re-rendered later against live
// formData (see generateShortHooks.js's pick/render split): freeze which
// comma-separated genre substring won as an index, not a value, so a later
// render against a possibly-edited originalGenre string reproduces the same
// *choice* (e.g. "still the 1st listed genre") instead of re-rolling a fresh
// random pick on every unrelated re-render.
export function pickGenrePartIndex(str) {
  const parts = splitGenreParts(str);
  return parts.length ? Math.floor(Math.random() * parts.length) : 0;
}

export function resolveGenrePartAtIndex(str, index) {
  const parts = splitGenreParts(str);
  if (!parts.length) return '';
  return parts[Math.min(index, parts.length - 1)];
}

// String-or-array song override resolution, matching generateCustomBlocks.js's
// resolveHookOverride. Duplicated (not imported) to keep this module dependency-light
// and avoid a circular import with generateCustomBlocks.js.
function resolveOverrideText(override) {
  if (Array.isArray(override)) {
    const options = override.filter((s) => typeof s === 'string' && s.trim());
    if (!options.length) return null;
    return options[Math.floor(Math.random() * options.length)].trim();
  }
  if (typeof override === 'string' && override.trim()) return override.trim();
  return null;
}

// {logNote} fills the log wrapper template's note slot — song override first
// (formData.songBlockOverrides.logBlock, falling back to the legacy
// formData.customLogNote field), else a random pick from the logNotes pool.
// Registered here (rather than hand-injected via ctx.overrides at one call
// site) so any caller resolving templates.long.logBlock gets a filled
// {logNote}, not just the Log block's own resolution in generateDescriptions.js.
function resolveLogNoteToken(ctx) {
  const overrides = ctx.formData.songBlockOverrides || {};
  const override = resolveOverrideText(overrides.logBlock) ?? resolveOverrideText(ctx.formData.customLogNote);
  if (override) {
    // Guard against {logNote} appearing inside its own override text, which
    // would otherwise recurse back into this same resolver forever — same
    // precedent as resolveTransformationToken's _resolvingTransformation.
    if (ctx._resolvingLogNote) return override;
    return fillPlaceholders(override, { ...ctx, _resolvingLogNote: true }).text;
  }

  const logNotes = ctx.projectConfig?.description?.templates?.long?.logNotes || [];
  return pickViableTemplate(logNotes, ctx)?.text ?? '';
}

// {fileId} is deterministic from artist/song + signal number — no randomness,
// so no recursion or freshness concerns. Exported separately (not just via
// REGISTRY) because generateDescriptions.js needs the raw value itself, not
// just its inline substitution — it's returned from generateDescriptions()
// for callers outside the description text (e.g. the AI-prompt generator,
// GeneratorResultsPanel's copy footer).
export function resolveFileId(ctx) {
  const fileCore = (ctx.formData.song || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('') || 'SIG';
  return `${fileCore}-${ctx.formData.signalNumber || '00'}`;
}

// {operatorStatus} — random pick from the project's operatorStatuses pool,
// same self-recursion guard as {logNote} since this pool is user-editable
// via Blocks → Hook Blocks → "Broadcast · Statuses" and could theoretically
// contain a phrase referencing {operatorStatus} itself.
function resolveOperatorStatusToken(ctx) {
  if (ctx._resolvingOperatorStatus) return 'unstable cycle';
  const operatorStatuses = ctx.projectConfig?.description?.operatorStatuses || [];
  return pickViableTemplate(operatorStatuses, { ...ctx, _resolvingOperatorStatus: true })?.text || 'unstable cycle';
}

// The generic placeholder set every engine (hooks, titles, descriptions) fills
// identically. Tokens NOT listed here (num, coverLabel, ...) are domain-specific
// and stay handled by their own engine file — leave them unresolved here so
// fillPlaceholders() doesn't shadow that behavior.
const REGISTRY = {
  artist: (ctx) => ctx.formData.artist || '',
  song: (ctx) => ctx.formData.song || '',
  year: (ctx) => ctx.formData.originalYear || '',
  years: (ctx) => ctx.formData.years || DEFAULT_YEARS,
  decade: (ctx) => resolveDecade(ctx.formData.transformationTags),
  signalNumber: (ctx) => ctx.formData.signalNumber || '',
  currentYear: () => String(new Date().getFullYear()),
  primaryTag: (ctx) => ctx.primaryTag,
  originalGenre: (ctx) => pickOneGenre(ctx.formData.originalGenre),
  tagLine: (ctx) => ctx.tagLine || '',
  logNote: (ctx) => resolveLogNoteToken(ctx),
  fileId: (ctx) => resolveFileId(ctx),
  operatorStatus: (ctx) => resolveOperatorStatusToken(ctx),
};

// Every general-purpose token this system resolves — the single source of
// truth for the placeholder-autocomplete lists shown in the editors (see
// hookPlaceholders.js). Adding a resolver to REGISTRY makes it show up in
// every editor automatically; nothing else needs to change.
export const REGISTRY_TOKENS = Object.keys(REGISTRY);

// Dynamic, namespaced tokens: {tags.<category>}, {links.<key>}, {custom.<key>}.
const DYNAMIC_PATTERNS = [
  {
    pattern: /^tags\.(.+)$/,
    resolve: (ctx, key) => resolveTagCategoryValue(key, ctx.formData.transformationTags, ctx.projectConfig),
  },
  {
    pattern: /^links\.(.+)$/,
    resolve: (ctx, key) => ctx.projectConfig?.description?.links?.[key] ?? '',
  },
  {
    pattern: /^custom\.(.+)$/,
    resolve: (ctx, key) => resolveCustomPlaceholder(key, ctx),
  },
];

// {transformation} fills its own nested template (transformationBlock), so it's
// resolved separately rather than living in REGISTRY — this keeps the inner
// template's own token resolution from being able to recurse into itself.
// The transformationBlock pool goes through the same filter-before-pick as
// every other candidate pool, so a template like "{tags.genre} reimagining"
// is skipped (not shown with a gap) when no genre-category tag is selected.
function resolveTransformationToken(ctx) {
  const innerCtx = { ...ctx, _resolvingTransformation: true };
  const overrides = ctx.formData.songBlockOverrides || {};
  const override = resolveOverrideText(overrides.transformation);

  let text;
  if (override) {
    text = fillPlaceholders(override, innerCtx).text;
  } else {
    const templates = ctx.projectConfig?.description?.templates?.long?.transformationBlock || [];
    text = pickViableTemplate(templates, innerCtx)?.text ?? '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Gathers candidate lines for a custom placeholder from its configured
// source(s): `tagField` (optionally scoped under `tagParentField`, e.g.
// description.log) pools a per-tag array field across every selected tag —
// same shape TagPhraseEditor's own parentField/field props already use, not
// a new vocabulary; `hookBlockKey` merges in an existing hook block's own
// template pool via the already-existing resolveHookBlockTemplates;
// `shortHookPool` merges in the entire eligible shortHookTypes pool (base +
// selected-tag templates, isFaithful/requiresGenre-filtered — the same set
// generateShortHooks.js draws Shorts Titles/the Shorts Hooks panel from) via
// the shared, dependency-free getEligibleShortHookTypeEntries. Any/all may be
// set at once — their candidates are simply combined into one pool.
function buildPlaceholderPool(def, ctx) {
  const source = def.source || {};
  const selectedTags = ctx.formData.transformationTags || [];
  const tagRegistry = ctx.projectConfig?.tags || {};

  const tagLines = source.tagField
    ? selectedTags.flatMap((tag) => {
        const tagData = tagRegistry[tag] || {};
        const parent = source.tagParentField ? tagData[source.tagParentField] : tagData;
        return parent?.[source.tagField] || [];
      })
    : [];

  const hookBlockLines = source.hookBlockKey
    ? resolveHookBlockTemplates(source.hookBlockKey, ctx.projectConfig) || []
    : [];

  const shortHookPoolLines = source.shortHookPool
    ? getEligibleShortHookTypeEntries(ctx.formData, ctx.projectConfig).flatMap(([type, hookConfig]) => [
        ...(hookConfig.templates || []),
        ...selectedTags.flatMap((tag) => ctx.projectConfig.tags?.[tag]?.shortHooks?.[type] || []),
      ])
    : [];

  return [...tagLines, ...hookBlockLines, ...shortHookPoolLines];
}

// Resolves a user-defined {custom.<key>} placeholder (description.placeholders
// in the resolved project config — see buildResolvedProjectConfig.js): pools
// candidate lines from its source(s), fills each candidate's own placeholders,
// and picks `count` (default 1, or `countOverride` when a caller needs to
// bypass the stored default — e.g. Broadcast Block reads the *existing*
// dynamic "Broadcast · Status Lines" hookBlockCounts value at generation
// time, rather than a static count baked into the placeholder definition,
// so a user's already-configured Lines-slider value keeps working exactly
// as before migration; the {custom.<key>} token syntax itself never passes
// this, only direct callers like generateDescriptions.js do). An unknown/
// stale key resolves to '' (not undefined) so it behaves like a
// legitimately-empty pool — the containing candidate template gets dropped
// by the standard "no fallback safety net" rule (see fillPlaceholders'
// hasEmpty), rather than leaking the raw {custom.x} token into output.
export function resolveCustomPlaceholder(key, ctx, countOverride) {
  const defs = ctx.projectConfig?.description?.placeholders || [];
  const def = defs.find((p) => p.key === key);
  if (!def) return '';

  const pool = buildPlaceholderPool(def, ctx);
  const count = countOverride ?? def.count ?? 1;
  return resolvePooledOutput(pool, ctx, fillPlaceholders, { count, joinWith: def.joinWith })?.text ?? '';
}

function resolveToken(token, ctx) {
  if (ctx.overrides && ctx.overrides[token] !== undefined) return ctx.overrides[token];
  if (token === 'transformation') {
    return ctx._resolvingTransformation ? undefined : resolveTransformationToken(ctx);
  }
  if (token in REGISTRY) return REGISTRY[token](ctx);

  for (const { pattern, resolve } of DYNAMIC_PATTERNS) {
    const match = token.match(pattern);
    if (match) return resolve(ctx, match[1]);
  }

  return undefined;
}

function findTokens(template) {
  const matches = [...template.matchAll(/\{([^{}]+)\}/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

function augmentCtx(rawCtx) {
  return {
    ...rawCtx,
    primaryTag:
      rawCtx.primaryTag ??
      resolvePrimaryTagValue(rawCtx.formData.transformationTags, rawCtx.projectConfig?.title?.primaryTag || {}),
  };
}

// Resolves every known placeholder in `template` against `ctx`:
// { formData, projectConfig, tagLine?, primaryTag?, overrides? }.
// `overrides` lets a caller supply a precomputed value for any token (e.g. hooks
// compute {transformation} once per generation batch and share it across every
// hook template, rather than re-rolling it per template like descriptions do).
// Unknown tokens (num, coverLabel, ...) are left untouched in the output.
// Returns { text, hasEmpty } — hasEmpty is true if any resolved value was ''.
export function fillPlaceholders(template, rawCtx) {
  const ctx = augmentCtx(rawCtx);

  let text = template;
  let hasEmpty = false;

  for (const token of findTokens(template)) {
    const value = resolveToken(token, ctx);
    if (value === undefined) continue;
    if (value === '') hasEmpty = true;
    text = text.split(`{${token}}`).join(String(value));
  }

  return { text, hasEmpty };
}

// Tokens that read live formData directly with no randomness of their own —
// always resolved fresh, never frozen. `originalGenre` is deliberately NOT
// here: it has its own internal random pick among comma-separated values
// (pickOneGenre) — Titles/Short Hooks freeze that specific case via
// pickGenrePartIndex/resolveGenrePartAtIndex instead (see generateShortHooks.js);
// description templates use {originalGenre} only in one deeply-nested spot
// (transformationBlock), where freezing the resolved value like any other
// random token is an accepted, documented simplification rather than
// threading index-freezing through every description ctx builder.
export const ALWAYS_LIVE_TOKENS = new Set(['artist', 'song', 'signalNumber', 'year', 'years', 'currentYear', 'decade', 'fileId']);

// PICK phase: resolves `template` once against `ctx`, same as fillPlaceholders,
// but also captures a frozen snapshot of every *non-live, not-already-overridden*
// token's resolved value. This is what lets a later render pass reproduce the
// exact same random selection (transformation, tags.*, primaryTag, logNote,
// operatorStatus, custom.* — anything pooled/randomized) instead of re-rolling
// it, while ALWAYS_LIVE_TOKENS and anything the caller already supplied via
// ctx.overrides stay live. Nested random resolution (e.g. a {custom.x} token
// that internally pools+picks a line) is captured as one opaque frozen string
// — the *outer* token's resolved value — so nothing inside placeholders.js
// itself needs its own pick/render split for this to work correctly.
export function fillPlaceholdersAndFreeze(template, rawCtx) {
  const ctx = augmentCtx(rawCtx);
  const frozen = {};

  for (const token of findTokens(template)) {
    if (ALWAYS_LIVE_TOKENS.has(token)) continue;
    if (ctx.overrides && ctx.overrides[token] !== undefined) continue;
    const value = resolveToken(token, ctx);
    if (value !== undefined) frozen[token] = value;
  }

  const { text, hasEmpty } = fillPlaceholders(template, rawCtx);
  return { text, hasEmpty, frozen };
}

// RENDER phase: re-fills `template` against live `ctx` — ALWAYS_LIVE_TOKENS
// and anything in ctx.overrides resolve fresh as normal, while every token
// captured in `frozen` (see fillPlaceholdersAndFreeze) replays its frozen
// value instead of re-resolving (and possibly re-rolling) it.
export function fillFrozenPlaceholders(template, ctx, frozen = {}) {
  return fillPlaceholders(template, { ...ctx, overrides: { ...frozen, ...ctx.overrides } });
}

// Convenience pair for the common "one template, freeze it, render it later"
// case — bundles the raw template string alongside its frozen token map so
// callers can pass a single { template, frozen } record around.
export function freezeTemplate(template, ctx) {
  const { frozen } = fillPlaceholdersAndFreeze(template, ctx);
  return { template, frozen };
}

export function renderFrozenTemplate({ template, frozen } = {}, ctx) {
  if (!template) return { text: '', hasEmpty: true };
  return fillFrozenPlaceholders(template, ctx, frozen);
}

// Resolves every candidate template against ctx, filters out any whose
// placeholders would render with an empty value, then picks randomly among
// what's left. Returns null if every candidate would be empty — callers treat
// that as "nothing to show" rather than displaying a half-filled line.
export function pickViableTemplate(templates, ctx) {
  if (!templates?.length) return null;

  const resolved = templates.map((template) => ({ template, ...fillPlaceholders(template, ctx) }));
  const viable = resolved.filter((r) => !r.hasEmpty);

  if (viable.length === 0) return null;

  return viable[Math.floor(Math.random() * viable.length)];
}

// Freeze-aware counterpart to pickViableTemplate: picks one random viable
// template exactly the same way, but freezes both which template won and
// its own non-live token resolutions, returning a { template, frozen }
// record instead of { template, text }. Pair with renderViableTemplateFrozen
// to re-fill against live formData without re-picking.
export function pickViableTemplateFrozen(templates, ctx) {
  if (!templates?.length) return null;

  const resolved = templates.map((template) => ({ template, ...fillPlaceholdersAndFreeze(template, ctx) }));
  const viable = resolved.filter((r) => !r.hasEmpty);

  if (viable.length === 0) return null;

  const winner = viable[Math.floor(Math.random() * viable.length)];
  return { template: winner.template, frozen: winner.frozen };
}

export function renderViableTemplateFrozen(picked, ctx) {
  if (!picked) return null;
  return { text: renderFrozenTemplate(picked, ctx).text, template: picked.template };
}

// Standalone entry point for callers (generateShortHooks.js) that need to
// compute {transformation} once and reuse it across many templates via
// ctx.overrides, rather than letting fillPlaceholders resolve it per-template.
export function resolveTransformation(ctx) {
  return resolveTransformationToken(ctx);
}
