export default function buildResolvedProjectConfig(
  projectConfig,
  tagOverrides,
) {
  const nextConfig = structuredClone(projectConfig);

  Object.entries(tagOverrides || {}).forEach(([tagName, override]) => {
    if (!nextConfig.tags?.[tagName]) return;

    nextConfig.tags[tagName] = {
      ...nextConfig.tags[tagName],
      ...override,
    };
  });

  return nextConfig;
}
