import { useMemo, useRef, useState } from 'react';

import { generateDescriptions } from '../engine/descriptions/generateDescriptions';
import { generateTitles } from '../engine/titles/generateTitles';
import { generateThumbnails } from '../engine/titles/generateThumbnails';
import { generateHashtags } from '../engine/hashtags/generateHashtags';
import { generateShortHooks } from '../engine/hooks/generateShortHooks';

export default function useGeneratedOutput(formData, resolvedProjectConfig) {
  // Forces regeneration of randomized outputs without changing form data.
  const [generationSeed, setGenerationSeed] = useState(0);

  // Always-current formData, read inside the memo below instead of the
  // `formData` param itself. This lets the memo depend on only a narrow
  // subset of fields (so a live edit to an unrelated field never triggers
  // regeneration) while still using the true latest values whenever it
  // *does* recompute. Must be updated synchronously during render, not in
  // a useEffect — an effect runs after commit, so it would still hold the
  // previous render's value at the exact moment the memo below recomputes.
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const handleRegenerate = () => {
    setGenerationSeed((prev) => prev + 1);
  };

  // Build all generated content from the current form data and project config.
  // Deliberately narrow deps: only a Transformation Tags change, an explicit
  // Regenerate click, a project switch (via resolvedProjectConfig), or a full
  // entry load/clear (via entryLoadToken) should re-roll randomized output.
  // Every other form field is read fresh via formDataRef when one of those
  // does fire, but editing it alone must not trigger a recompute.
  const generatedOutput = useMemo(() => {
    const currentFormData = formDataRef.current;

    const shortHooks = generateShortHooks(currentFormData, resolvedProjectConfig);

    const titles = generateTitles(currentFormData, resolvedProjectConfig, shortHooks);

    const thumbnails = generateThumbnails(
      currentFormData,
      resolvedProjectConfig,
      resolvedProjectConfig.thumbnail?.count ?? 5,
    );

    const { longDescription, longDescriptionSegments, shortDescriptions, shortDescriptionSegments, fileId } = generateDescriptions(
      currentFormData,
      resolvedProjectConfig,
    );

    const hashtagOutput = generateHashtags(currentFormData, resolvedProjectConfig);

    return {
      titles,
      thumbnails,
      longDescription,
      longDescriptionSegments,
      shortDescriptions,
      shortDescriptionSegments,
      hashtags: hashtagOutput.hashtags,
      youtubeTags: hashtagOutput.youtubeTags,
      shortHooks,
      fileId,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData
  }, [resolvedProjectConfig, generationSeed, formData.transformationTags, formData.entryLoadToken]);

  return {
    generatedOutput,
    handleRegenerate,
  };
}
