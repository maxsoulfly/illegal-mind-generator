import { resolveTagOverride } from './resolveTagOverride';

function mergeProjectOverrides(projectConfig, projectSettingsOverrides = {}) {
  return {
    ...projectConfig,
    ...projectSettingsOverrides,

    title: {
      ...(projectConfig.title || {}),
      ...(projectSettingsOverrides.title || {}),
      templates: {
        ...(projectConfig.title?.templates || {}),
        ...(projectSettingsOverrides.title?.templates || {}),
      },
    },

    shortHookTypes: {
      ...(projectConfig.shortHookTypes || {}),
      ...(projectSettingsOverrides.shortHookTypes || {}),
    },

    thumbnail: {
      ...(projectConfig.thumbnail || {}),
      ...(projectSettingsOverrides.thumbnail || {}),
      patterns: {
        ...(projectConfig.thumbnail?.patterns || {}),
        ...(projectSettingsOverrides.thumbnail?.patterns || {}),
      },
    },

    description: {
      ...(projectConfig.description || {}),
      ...(projectSettingsOverrides.description || {}),
      templates: {
        ...(projectConfig.description?.templates || {}),
        ...(projectSettingsOverrides.description?.templates || {}),
        long: {
          ...(projectConfig.description?.templates?.long || {}),
          ...(projectSettingsOverrides.description?.templates?.long || {}),
          customBlocks: {
            ...(projectConfig.description?.templates?.long?.customBlocks || {}),
            ...(projectSettingsOverrides.description?.templates?.long?.customBlocks || {}),
          },
          phraseBlockScopes: {
            ...(projectConfig.description?.templates?.long?.phraseBlockScopes || {}),
            ...(projectSettingsOverrides.description?.templates?.long?.phraseBlockScopes || {}),
          },
        },
        shorts: {
          ...(projectConfig.description?.templates?.shorts || {}),
          ...(projectSettingsOverrides.description?.templates?.shorts || {}),
        },
      },
      links: {
        ...(projectConfig.description?.links || {}),
        ...(projectSettingsOverrides.description?.links || {}),
      },
    },
  };
}

export default function buildResolvedProjectConfig(
  projectConfig,
  tagOverrides,
  projectSettingsOverrides,
) {
  const nextConfig = structuredClone(
    mergeProjectOverrides(projectConfig, projectSettingsOverrides),
  );

  // Append user-created hook blocks (stored in overrides) to the resolved
  // hookBlocks array so all downstream code sees them alongside JSON-defined ones.
  // Filter out any stale customHookBlocks entry whose key already exists in the
  // base JSON hookBlocks — prevents duplicates caused by stale localStorage data.
  const customHookBlocks = nextConfig.description?.customHookBlocks || [];
  if (customHookBlocks.length) {
    const baseHookKeys = new Set(
      (projectConfig.description?.hookBlocks || []).map((b) => b.key),
    );
    nextConfig.description.hookBlocks = [
      ...(projectConfig.description?.hookBlocks || []),
      ...customHookBlocks
        .filter((b) => !baseHookKeys.has(b.key))
        .map((b) => ({
          key: b.key,
          label: b.label,
          path: 'long',
          templateKey: b.key,
        })),
    ];
  }

  // Block Groups: JSON-default groups (projectConfig.description.blockGroups)
  // get per-key edits merged in via blockGroupOverrides — one consolidated
  // patch object per group (label/scope/target/children all edited together
  // from a single card), unlike hookBlocks' many independently-toggled
  // *Overrides maps. User-created groups (customBlockGroups) are appended
  // after, same append-and-dedupe shape as customHookBlocks above — filtered
  // so stale localStorage data can't shadow a JSON-default key.
  const baseBlockGroups = projectConfig.description?.blockGroups || [];
  const blockGroupOverrides = nextConfig.description?.blockGroupOverrides || {};
  const customBlockGroups = nextConfig.description?.customBlockGroups || [];
  if (baseBlockGroups.length || customBlockGroups.length) {
    const baseGroupKeys = new Set(baseBlockGroups.map((g) => g.key));
    nextConfig.description.blockGroups = [
      ...baseBlockGroups.map((g) => ({ ...g, ...(blockGroupOverrides[g.key] || {}) })),
      ...customBlockGroups.filter((g) => !baseGroupKeys.has(g.key)),
    ];
  }

  // Custom Placeholders: same shape as Block Groups above — JSON-default
  // placeholders (projectConfig.description.placeholders) get per-key edits
  // merged in via placeholderOverrides, user-created ones (customPlaceholders)
  // are appended after, filtered so stale localStorage data can't shadow a
  // JSON-default key.
  const basePlaceholders = projectConfig.description?.placeholders || [];
  const placeholderOverrides = nextConfig.description?.placeholderOverrides || {};
  const customPlaceholders = nextConfig.description?.customPlaceholders || [];
  if (basePlaceholders.length || customPlaceholders.length) {
    const basePlaceholderKeys = new Set(basePlaceholders.map((p) => p.key));
    nextConfig.description.placeholders = [
      ...basePlaceholders.map((p) => ({ ...p, ...(placeholderOverrides[p.key] || {}) })),
      ...customPlaceholders.filter((p) => !basePlaceholderKeys.has(p.key)),
    ];
  }

  Object.entries(tagOverrides || {}).forEach(([tagName, override]) => {
    const baseTag = nextConfig.tags?.[tagName] || {};
    nextConfig.tags[tagName] = resolveTagOverride(baseTag, override);
  });

  return nextConfig;
}
