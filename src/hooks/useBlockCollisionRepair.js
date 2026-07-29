import { useEffect } from 'react';

import { resolveCustomBlockCollisions } from '../utils/customBlocks';

// Self-healing repair for customBlocks keys that collide with a hook
// block's key/layout-key (see resolveCustomBlockCollisions) — silently
// breaks generation for the colliding hook block otherwise. Runs whenever
// the resolved hookBlocks set or overrides change; naturally stabilizes
// after one fix since the next run finds no more collisions to repair.
export default function useBlockCollisionRepair(projectSettingsOverrides, resolvedProjectConfig, updateProjectOverride) {
  useEffect(() => {
    const result = resolveCustomBlockCollisions(
      projectSettingsOverrides,
      resolvedProjectConfig.description?.hookBlocks || [],
      resolvedProjectConfig.description?.blockGroups || [],
    );
    if (!result) return;

    if (result.skipped.length) {
      console.warn(
        'Song-scoped custom block(s) collide with a Hook Block key and were not auto-renamed (per-song override data can\'t be safely migrated automatically):',
        result.skipped.map((s) => s.oldKey),
      );
    }
    if (result.patch) {
      console.warn(
        'Renamed colliding custom block key(s) to fix generation:',
        result.renamed,
      );
      updateProjectOverride(result.patch);
    }
  }, [projectSettingsOverrides, resolvedProjectConfig, updateProjectOverride]);
}
