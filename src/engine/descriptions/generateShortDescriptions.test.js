// Smoke test for the Shorts song-scoped List block override bug fix.
//
// This project has no test runner configured (no vitest/jest). Run this file
// directly with rolldown (already a transitive Vite 8 dependency, see
// node_modules/.bin/rolldown) bundling it to a temporary ESM file, then
// executing that with node — same "Node smoke test" pattern used throughout
// this project's history (see CLAUDE.md Current Focus entries), just kept
// here as a persisted, re-runnable file instead of a throwaway script:
//
//   npx rolldown src/engine/descriptions/generateShortDescriptions.test.js \
//     -f esm -p node -o /tmp/gsd.test.mjs && node /tmp/gsd.test.mjs
//
// Covers the bug fixed 2026-08-29: a song-scoped List block's per-song
// override (formData.songBlockOverrides[blockKey]) was silently ignored by
// the Shorts description engine (it was already applied correctly by the
// Long description engine). See generateShortDescriptions.js's
// pickShortLine/renderShortLine 'list' branch.

import { pickShortDescriptions, renderShortDescriptions } from './generateShortDescriptions';
import { renderCustomBlock, pickCustomBlockDefault, getEffectiveSongOverrides } from './generateCustomBlocks';

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    failures++;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`PASS: ${message}`);
  }
}

// Minimal project config: one song-scoped List block ("gearBlock"), targeted
// at Shorts, as the sole block in the Shorts layout — isolates the case with
// no other blocks/randomness in the way.
function buildProjectConfig() {
  return {
    title: {},
    tags: {},
    description: {
      links: {},
      hookBlocks: [],
      templates: {
        long: {
          customBlocks: {
            gearBlock: {
              title: 'Gear Used',
              scope: 'song',
              target: 'both',
              items: [
                { label: 'Guitar', text: 'Default Guitar' },
                { label: 'Mic', text: 'Default Mic' },
              ],
            },
          },
        },
        shorts: {
          count: 1,
          layout: ['gearBlock'],
          coverLabel: '',
          header: ['{artist} - {song}'],
        },
      },
    },
  };
}

function buildFormData(songBlockOverrides = {}) {
  return {
    artist: 'Test Artist',
    song: 'Test Song',
    signalNumber: '01',
    transformationTags: [],
    songBlockOverrides,
  };
}

function generateShorts(formData, projectConfig) {
  const picked = pickShortDescriptions(formData, projectConfig);
  return renderShortDescriptions(picked, formData, projectConfig);
}

const projectConfig = buildProjectConfig();

// --- Case 1: no override — project default List items are used ---
{
  const formData = buildFormData();
  const { shortDescriptions, shortDescriptionSegments } = generateShorts(formData, projectConfig);
  const text = shortDescriptions[0];

  assert(text.includes('Default Guitar'), 'no override: project default "Default Guitar" appears in Shorts output');
  assert(text.includes('Default Mic'), 'no override: project default "Default Mic" appears in Shorts output');
  assert(!text.includes('Override'), 'no override: no override text leaks in when none is set');

  const gearSegment = shortDescriptionSegments[0].find((s) => s.source?.blockKey === 'gearBlock');
  assert(
    gearSegment?.source?.type === 'block',
    `no override: segment source type is "block" (project default), got ${JSON.stringify(gearSegment?.source)}`,
  );
}

// --- Case 2: song-specific override — Shorts output uses overridden items ---
{
  const formData = buildFormData({
    gearBlock: {
      items: [
        { label: 'Guitar', text: 'Override Guitar' },
        { label: 'Interface', text: 'Override Interface' },
      ],
    },
  });
  const { shortDescriptions, shortDescriptionSegments } = generateShorts(formData, projectConfig);
  const text = shortDescriptions[0];

  assert(text.includes('Override Guitar'), 'with override: overridden "Override Guitar" appears in Shorts output');
  assert(text.includes('Override Interface'), 'with override: overridden "Override Interface" appears in Shorts output');
  assert(!text.includes('Default Guitar'), 'with override: project default "Default Guitar" is replaced, not merged');
  assert(!text.includes('Default Mic'), 'with override: project default "Default Mic" is replaced, not merged');

  const gearSegment = shortDescriptionSegments[0].find((s) => s.source?.blockKey === 'gearBlock');
  assert(
    gearSegment?.source?.type === 'override',
    `with override: segment source type is "override", got ${JSON.stringify(gearSegment?.source)}`,
  );
}

// --- Case 3: override cleared — falls back to project defaults again ---
{
  const formData = buildFormData({}); // explicitly empty, same as "cleared"
  const { shortDescriptions } = generateShorts(formData, projectConfig);
  const text = shortDescriptions[0];

  assert(text.includes('Default Guitar'), 'cleared override: falls back to project default "Default Guitar"');
  assert(text.includes('Default Mic'), 'cleared override: falls back to project default "Default Mic"');
}

// --- Regression check: Long descriptions (already correct) stay correct ---
{
  const block = projectConfig.description.templates.long.customBlocks.gearBlock;
  const ctx = { formData: buildFormData(), projectConfig, tagLine: '' };
  const picked = pickCustomBlockDefault(block, ctx);

  const withOverride = renderCustomBlock(
    picked,
    ctx,
    {},
    getEffectiveSongOverrides(buildFormData({ gearBlock: { items: [{ label: 'Guitar', text: 'Override Guitar' }] } })).gearBlock,
  );
  assert(
    withOverride.includes('Override Guitar') && !withOverride.includes('Default Guitar'),
    'regression: Long description engine still applies List overrides correctly',
  );
}

if (failures > 0) {
  // Throwing (rather than process.exit, a Node global this project's
  // browser-focused eslint config doesn't declare) still gives a non-zero
  // exit code when run directly with node.
  throw new Error(`${failures} check(s) failed.`);
}
console.log('\nAll checks passed.');
