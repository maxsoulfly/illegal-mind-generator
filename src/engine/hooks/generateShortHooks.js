import { fillPlaceholders, resolveTransformation, pickGenrePartIndex, resolveGenrePartAtIndex } from '../placeholders';
import { pickRandomLines } from '../pooling';
import { getEligibleShortHookTypeEntries } from './shortHookEligibility';

// Shared by both phases so pick-time viability checks and render-time text
// use identical substitution rules. `transformation` and `genrePartIndex` are
// frozen selections (see pickShortHooks) — everything else here reads
// straight from `formData`, so passing a *live* formData in here is what
// makes the render phase reflect fresh artist/song/signal/genre edits.
function buildCtx(formData, projectConfig, transformation, genrePartIndex) {
  const artist = (formData.useCustomArtistShort && formData.artistShort)
    ? formData.artistShort
    : formData.artist || 'This band';

  return {
    formData,
    projectConfig,
    overrides: {
      artist,
      song: formData.song || 'this song',
      num: formData.signalNumber || 'XX',
      transformation,
      originalGenre: resolveGenrePartAtIndex(formData.originalGenre, genrePartIndex),
    },
  };
}

function createRecord(template, type, sourceType, sourceTag, genrePartIndex) {
  return { sourceText: template, sourceType, sourceTag, hookType: type, genrePartIndex };
}

// PICK phase: every random selection lives here — which hook types are
// eligible, which 2 hooks per type win, the shared {transformation} phrase,
// and (per hook) which comma-separated {originalGenre} substring wins. This
// is the part that must stay frozen except via Transformation Tags /
// Regenerate / entry load-clear (see useGeneratedOutput.js's narrow-deps
// memo) — call renderShortHooks (below) against live formData for display,
// don't re-call this on every render.
export function pickShortHooks(formData, projectConfig) {
  const transformation = resolveTransformation({ formData, projectConfig });

  const groups = getEligibleShortHookTypeEntries(formData, projectConfig).map(([type, hookConfig]) => {
    const candidates = [
      ...(hookConfig.templates || []).map((template) =>
        createRecord(template, type, 'base', '', pickGenrePartIndex(formData.originalGenre)),
      ),
      ...(formData.transformationTags || []).flatMap((tag) =>
        (projectConfig.tags?.[tag]?.shortHooks?.[type] || []).map((template) =>
          createRecord(template, type, 'tag', tag, pickGenrePartIndex(formData.originalGenre)),
        ),
      ),
    ];

    // Hooks whose placeholders would render empty (e.g. {tags.genre} with no
    // genre-category tag selected) are dropped rather than shown half-filled.
    const viable = candidates.filter((record) => {
      const ctx = buildCtx(formData, projectConfig, transformation, record.genrePartIndex);
      return !fillPlaceholders(record.sourceText, ctx).hasEmpty;
    });

    return { type, label: hookConfig.label || type, hooks: pickRandomLines(viable, 2) };
  });

  // Cover-specific hooks (formData.coverShortHooks): a flat, uncategorized
  // per-cover list, joined as its own internal group with NO eligibility
  // filters (they're hand-written specifics — always in play for the loaded
  // cover). Same fillPlaceholders viability check + pick-2 as every other
  // group, so these flow into the shuffled mix below (and buildHookTitles)
  // exactly like base/tag hooks. `'cover'` is plumbing, not a user-facing
  // hook category — the editor and the AI prompt stay flat.
  const coverViable = (formData.coverShortHooks || [])
    .map((template) =>
      createRecord(template, 'cover', 'cover', '', pickGenrePartIndex(formData.originalGenre)),
    )
    .filter((record) => {
      const ctx = buildCtx(formData, projectConfig, transformation, record.genrePartIndex);
      return !fillPlaceholders(record.sourceText, ctx).hasEmpty;
    });
  if (coverViable.length) {
    groups.push({ type: 'cover', label: 'Cover-Specific', hooks: pickRandomLines(coverViable, 2) });
  }

  // TitlesPanel/ShortHooksPanel show a shuffled mix pulled from across every
  // type (not grouped by type) — that shuffle+pick is itself a random
  // selection, so it must be frozen here too. Freezing the *order* once and
  // letting callers .slice(0, limit) it (a plain, non-random truncation)
  // means the visible subset can't change just because renderShortHooks
  // produced a new array reference on some unrelated live re-render.
  const allRecords = groups.flatMap((group) =>
    group.hooks.map((record) => ({ ...record, hookTypeLabel: group.label })),
  );
  const mixedRecords = pickRandomLines(allRecords, allRecords.length);

  return { transformation, groups, mixedRecords };
}

function renderRecord(record, formData, projectConfig, transformation, prefixEnabled, prefix, suffixEnabled, suffix) {
  const ctx = buildCtx(formData, projectConfig, transformation, record.genrePartIndex);
  const { text: rawText } = fillPlaceholders(record.sourceText, ctx);

  return {
    text: `${prefixEnabled ? fillPlaceholders(prefix, ctx).text : ''}${rawText}${suffixEnabled ? fillPlaceholders(suffix, ctx).text : ''}`,
    rawText,
    sourceText: record.sourceText,
    sourceType: record.sourceType,
    sourceTag: record.sourceTag,
    hookType: record.hookType,
    ...(record.hookTypeLabel !== undefined ? { hookTypeLabel: record.hookTypeLabel } : {}),
  };
}

// RENDER phase: pure placeholder substitution against `formData`/
// `projectConfig` — no randomness, safe (and intended) to re-run on every
// form edit that touches a placeholder (artist, song, artist-short, signal
// number, genre). `sourceText` (the raw, unfilled template) is preserved on
// every hook for click-to-navigate/tooltip use — see ShortHookTitles.jsx.
// Returns `{ groups, mixed }` — `mixed` is the frozen shuffled-across-types
// order from pickShortHooks; callers slice it to however many they want to
// display (TitlesPanel/ShortHooksPanel), which is safe precisely because
// that order never changes on a render-only call.
export function renderShortHooks(picked, formData, projectConfig) {
  const prefix = projectConfig.title?.shortsPrefix || '';
  const suffix = projectConfig.title?.shortsSuffix ?? projectConfig.title?.shortHookSuffix ?? '';
  const prefixEnabled = projectConfig.title?.shortsPrefixEnabled !== false;
  const suffixEnabled = projectConfig.title?.shortsSuffixEnabled !== false;

  const render = (record) =>
    renderRecord(record, formData, projectConfig, picked.transformation, prefixEnabled, prefix, suffixEnabled, suffix);

  return {
    groups: picked.groups.map(({ type, label, hooks }) => ({ type, label, hooks: hooks.map(render) })),
    mixed: picked.mixedRecords.map(render),
  };
}

// Back-compat convenience: pick + render in one call, matching the pick/
// render split's combined shape (`{ groups, mixed }`). Fine for any caller
// that doesn't need the live-refresh split (e.g. a one-off smoke test).
export function generateShortHooks(formData, projectConfig) {
  return renderShortHooks(pickShortHooks(formData, projectConfig), formData, projectConfig);
}
