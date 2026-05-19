export default function buildResolvedProjectConfig(
  projectConfig,
  tagOverrides,
) {
  const nextConfig = structuredClone(projectConfig);

  Object.entries(tagOverrides || {}).forEach(([tagName, override]) => {
    const baseTag = nextConfig.tags?.[tagName] || {};

    nextConfig.tags[tagName] = {
      ...baseTag,
      ...override,
      description: {
        ...(baseTag.description || {}),
        ...(override.description || {}),
      },
    };
  });

  return nextConfig;
}
