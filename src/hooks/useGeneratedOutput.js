import { useMemo, useState } from 'react';

import { generateDescriptions } from '../engine/descriptions/generateDescriptions';
import { generateTitles } from '../engine/titles/generateTitles';
import { generateThumbnails } from '../engine/titles/generateThumbnails';
import { generateHashtags } from '../engine/hashtags/generateHashtags';
import { generateShortHooks } from '../engine/hooks/generateShortHooks';

export default function useGeneratedOutput(formData, resolvedProjectConfig) {
  // Forces regeneration of randomized outputs without changing form data.
  const [generationSeed, setGenerationSeed] = useState(0);

  const handleRegenerate = () => {
    setGenerationSeed((prev) => prev + 1);
  };

  // Build all generated content from the current form data and project config.
  const generatedOutput = useMemo(() => {
    const titles = generateTitles(formData, resolvedProjectConfig);

    const thumbnails = generateThumbnails(formData, resolvedProjectConfig);

    const shortHooks = generateShortHooks(formData, resolvedProjectConfig);

    const { longDescription, shortDescriptions, fileId } = generateDescriptions(
      formData,
      resolvedProjectConfig,
      shortHooks,
    );

    const hashtagOutput = generateHashtags(formData, resolvedProjectConfig);

    return {
      titles,
      thumbnails,
      longDescription,
      shortDescriptions,
      hashtags: hashtagOutput.hashtags,
      youtubeTags: hashtagOutput.youtubeTags,
      shortHooks,
      fileId,
    };
  }, [formData, resolvedProjectConfig, generationSeed]);

  return {
    generatedOutput,
    handleRegenerate,
  };
}
