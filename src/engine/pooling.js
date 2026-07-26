// Picks up to `count` random, non-repeating lines from a pool (order not
// preserved). Shared by every hook block that can output more than one line
// per generation, so "randomly chosen" means the same thing everywhere.
export function pickRandomLines(pool = [], count = 1) {
  return [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.max(0, count));
}

// Resolves a pool of raw template strings to final output: fills each
// candidate's own placeholders via `resolveFn` (fillPlaceholders, injected
// rather than imported here to avoid a circular dependency with
// placeholders.js — see placeholders.js's resolveCustomPlaceholder), drops
// any candidate whose resolution touched an empty value, then picks `count`
// from what's left and joins with `joinWith`. Returns null when there's
// nothing to pick from. `template` on the result is the winning template's
// raw text — only meaningful when exactly one line was picked, since with
// multiple lines there's no single "the" winner.
export function resolvePooledOutput(templates, ctx, resolveFn, { count = 1, joinWith = '\n' } = {}) {
  if (!templates?.length) return null;

  const resolved = templates.map((template) => ({ template, ...resolveFn(template, ctx) }));
  const viable = resolved.filter((r) => !r.hasEmpty);
  if (viable.length === 0) return null;

  const picked = pickRandomLines(viable, Math.min(count, viable.length));

  return {
    text: picked.map((r) => r.text).join(joinWith),
    template: picked.length === 1 ? picked[0].template : undefined,
  };
}

// Freeze-aware counterpart to resolvePooledOutput, split into pick/render so
// a caller can freeze which `count` templates won (and each one's own
// non-live token resolutions) at "pick" time, then re-fill them against live
// formData at "render" time without re-picking. `freezeFn` is
// fillPlaceholdersAndFreeze, `renderFn` is fillFrozenPlaceholders — injected
// rather than imported, same reasoning as resolvePooledOutput's `resolveFn`
// (avoids a circular dependency with placeholders.js).
export function pickPooledTemplates(templates, ctx, freezeFn, { count = 1 } = {}) {
  if (!templates?.length) return [];

  const resolved = templates.map((template) => ({ template, ...freezeFn(template, ctx) }));
  const viable = resolved.filter((r) => !r.hasEmpty);
  if (viable.length === 0) return [];

  return pickRandomLines(viable, Math.min(count, viable.length)).map(({ template, frozen }) => ({ template, frozen }));
}

export function renderPooledTemplates(picked, ctx, renderFn, { joinWith = '\n' } = {}) {
  if (!picked?.length) return null;

  const rendered = picked.map(({ template, frozen }) => ({ template, text: renderFn(template, ctx, frozen).text }));

  return {
    text: rendered.map((r) => r.text).join(joinWith),
    template: rendered.length === 1 ? rendered[0].template : undefined,
  };
}
