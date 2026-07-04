import { resolveTagCategoryValue } from './descriptions/descriptionTagHelpers';

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

function pickOneGenre(str) {
  if (!str) return '';
  const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
  return parts[Math.floor(Math.random() * parts.length)] || '';
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

// The generic placeholder set every engine (hooks, titles, descriptions) fills
// identically. Tokens NOT listed here (num, coverLabel, fileId, operatorStatus,
// logNote, ...) are domain-specific and stay handled by their own engine file —
// leave them unresolved here so fillPlaceholders() doesn't shadow that behavior.
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
};

// Every general-purpose token this system resolves — the single source of
// truth for the placeholder-autocomplete lists shown in the editors (see
// hookPlaceholders.js). Adding a resolver to REGISTRY makes it show up in
// every editor automatically; nothing else needs to change.
export const REGISTRY_TOKENS = Object.keys(REGISTRY);

// Dynamic, namespaced tokens: {tags.<category>}, {links.<key>}.
const DYNAMIC_PATTERNS = [
  {
    pattern: /^tags\.(.+)$/,
    resolve: (ctx, key) => resolveTagCategoryValue(key, ctx.formData.transformationTags, ctx.projectConfig),
  },
  {
    pattern: /^links\.(.+)$/,
    resolve: (ctx, key) => ctx.projectConfig?.description?.links?.[key] ?? '',
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

// Resolves every known placeholder in `template` against `ctx`:
// { formData, projectConfig, tagLine?, primaryTag?, overrides? }.
// `overrides` lets a caller supply a precomputed value for any token (e.g. hooks
// compute {transformation} once per generation batch and share it across every
// hook template, rather than re-rolling it per template like descriptions do).
// Unknown tokens (num, coverLabel, ...) are left untouched in the output.
// Returns { text, hasEmpty } — hasEmpty is true if any resolved value was ''.
export function fillPlaceholders(template, rawCtx) {
  const ctx = {
    ...rawCtx,
    primaryTag:
      rawCtx.primaryTag ??
      resolvePrimaryTagValue(rawCtx.formData.transformationTags, rawCtx.projectConfig?.title?.primaryTag || {}),
  };

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

// Standalone entry point for callers (generateShortHooks.js) that need to
// compute {transformation} once and reuse it across many templates via
// ctx.overrides, rather than letting fillPlaceholders resolve it per-template.
export function resolveTransformation(ctx) {
  return resolveTransformationToken(ctx);
}
