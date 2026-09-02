// Smoke test: the new per-tag `promptContext` field (a human-authored "what
// this tag means" note, used only as semantic context for the Copy AI Prompt
// helper on the Short Hooks tab) survives every merge point it passes
// through. It is a plain flat scalar with no dedicated storage column — it
// rides in the tag override's `payload` jsonb — so nothing special was added
// for it; this test guards that the existing spreads keep carrying it.
//
// Run: npx rolldown src/utils/tagPromptContext.test.js -f esm -p node \
//        -o /tmp/tpc.test.mjs && node /tmp/tpc.test.mjs

import { resolveTagOverride } from './resolveTagOverride';
import { buildEffectiveTag, mergeTagData } from '../../server/tagMerge.js';

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    failures++;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`PASS: ${message}`);
  }
}

// --- resolveTagOverride (client: buildResolvedProjectConfig + buildTagExplorerData) ---
{
  assert(
    resolveTagOverride({ promptContext: 'base meaning' }, {}).promptContext === 'base meaning',
    'resolveTagOverride: base promptContext survives when override has none',
  );
  assert(
    resolveTagOverride({ promptContext: 'base' }, { promptContext: 'override wins' }).promptContext ===
      'override wins',
    'resolveTagOverride: override promptContext wins over base',
  );
  assert(
    resolveTagOverride({ label: 'Darker' }, {}).promptContext === undefined,
    'resolveTagOverride: absent everywhere -> undefined (buildTagExplorerData coerces to "")',
  );
  // Regression: adding promptContext must not disturb the deep-merged fields.
  {
    const resolved = resolveTagOverride(
      { promptContext: 'x', description: { technical: ['t1'], log: ['l1'] } },
      { description: { log: ['l2'] } },
    );
    assert(
      resolved.description.technical[0] === 't1' && resolved.description.log[0] === 'l2',
      'resolveTagOverride: description still one-level-deep merged alongside promptContext',
    );
  }
}

// --- buildEffectiveTag (server: base tag + override -> effective tag) ---
{
  assert(
    buildEffectiveTag({ promptContext: 'base' }, { promptContext: 'ov' }).promptContext === 'ov',
    'buildEffectiveTag: override promptContext wins over base',
  );
  assert(
    buildEffectiveTag({ promptContext: 'base' }, {}).promptContext === 'base',
    'buildEffectiveTag: base promptContext survives an empty override',
  );
}

// --- mergeTagData (server: sync / copy-tag) — target wins so a project's own
//     authored explanation is never clobbered by a sync from elsewhere ---
{
  assert(
    mergeTagData({ promptContext: 'target keeps this' }, { promptContext: 'source' }).promptContext ===
      'target keeps this',
    'mergeTagData: target promptContext wins (sync does not overwrite an existing explanation)',
  );
  assert(
    mergeTagData({}, { promptContext: 'from source' }).promptContext === 'from source',
    'mergeTagData: source promptContext fills in when target has none',
  );
  // Regression: promptContext carriage must not disturb the Set-union arrays.
  {
    const merged = mergeTagData(
      { promptContext: 'a', title: ['T1'] },
      { promptContext: 'b', title: ['T2'] },
    );
    assert(
      merged.title.includes('T1') && merged.title.includes('T2'),
      'mergeTagData: title still Set-union merged alongside promptContext',
    );
  }
}

// --- Structural note (not executable here): server/routes/tagOverrides.js's
//     splitOverride() destructures only label/category/visible/isCustom and
//     routes every other key into `payload` (jsonb), and rowToOverride()
//     spreads `row.payload` back out first. So promptContext persists via
//     `payload = tag_overrides.payload || EXCLUDED.payload` on PUT and is
//     returned on GET with no route or migration change. Verified by reading
//     that file; kept here as a pointer.

if (failures > 0) {
  throw new Error(`${failures} check(s) failed.`);
}
console.log('\nAll checks passed.');
