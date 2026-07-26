import { useMemo, useRef, useState } from 'react';

import { generateDescriptions } from '../engine/descriptions/generateDescriptions';
import { pickTitles, renderTitles } from '../engine/titles/generateTitles';
import { pickThumbnails, renderThumbnails } from '../engine/titles/generateThumbnails';
import { generateHashtags } from '../engine/hashtags/generateHashtags';
import { pickShortHooks, renderShortHooks } from '../engine/hooks/generateShortHooks';

export default function useGeneratedOutput(formData, resolvedProjectConfig) {
  // Forces regeneration of randomized outputs without changing form data.
  const [generationSeed, setGenerationSeed] = useState(0);

  // Always-current formData, read inside the memos below instead of the
  // `formData` param itself. This lets a memo depend on only a narrow subset
  // of fields (so a live edit to an unrelated field never triggers a re-pick)
  // while still using the true latest values whenever it *does* recompute.
  // Must be updated synchronously during render, not in a useEffect — an
  // effect runs after commit, so it would still hold the previous render's
  // value at the exact moment a memo below recomputes.
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const handleRegenerate = () => {
    setGenerationSeed((prev) => prev + 1);
  };

  // PICK phase: every random selection (which hook/template/tag phrase won)
  // lives here. Deliberately narrow deps — only a Transformation Tags
  // change, an explicit Regenerate click, a project switch (via
  // resolvedProjectConfig), or a full entry load/clear (via entryLoadToken)
  // should re-roll anything. Every other form field is read fresh via
  // formDataRef when one of those does fire, but editing it alone must not
  // trigger a recompute here.
  const pickedOutput = useMemo(() => {
    const currentFormData = formDataRef.current;

    const pickedShortHooks = pickShortHooks(currentFormData, resolvedProjectConfig);
    // Titles' "mix hooks into Long titles" feature isn't on the live-refresh
    // path yet — feed it a one-off render of the picked hooks, frozen until
    // the next pick.
    const shortHooksForTitles = renderShortHooks(pickedShortHooks, currentFormData, resolvedProjectConfig);
    const pickedTitles = pickTitles(currentFormData, resolvedProjectConfig, shortHooksForTitles.groups);
    const pickedThumbnails = pickThumbnails(
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
      pickedShortHooks,
      pickedTitles,
      pickedThumbnails,
      longDescription,
      longDescriptionSegments,
      shortDescriptions,
      shortDescriptionSegments,
      hashtags: hashtagOutput.hashtags,
      youtubeTags: hashtagOutput.youtubeTags,
      fileId,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData
  }, [resolvedProjectConfig, generationSeed, formData.transformationTags, formData.entryLoadToken]);

  // RENDER phase: pure placeholder substitution against live formData — no
  // randomness, so it's safe (and the whole point) to re-run on every field
  // that feeds a placeholder, without re-picking which hooks/templates won.
  // This is what makes Titles/Thumbnails/Short Hooks reflect a fresh
  // Artist/Song/Artist Short/Signal Number/Genre edit immediately, while the
  // actual selection stays exactly as frozen by the PICK phase above.
  const shortHooks = useMemo(
    () => renderShortHooks(pickedOutput.pickedShortHooks, formDataRef.current, resolvedProjectConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData; these deps just decide *when* to re-render, not what's read
    [
      pickedOutput.pickedShortHooks,
      resolvedProjectConfig,
      formData.artist,
      formData.song,
      formData.artistShort,
      formData.useCustomArtistShort,
      formData.signalNumber,
      formData.originalGenre,
    ],
  );

  const titles = useMemo(
    () => renderTitles(pickedOutput.pickedTitles, formDataRef.current, resolvedProjectConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData; these deps just decide *when* to re-render, not what's read
    [
      pickedOutput.pickedTitles,
      resolvedProjectConfig,
      formData.artist,
      formData.song,
      formData.artistShort,
      formData.useCustomArtistShort,
      formData.signalNumber,
    ],
  );

  const thumbnails = useMemo(
    () => renderThumbnails(pickedOutput.pickedThumbnails, formDataRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData; these deps just decide *when* to re-render, not what's read
    [
      pickedOutput.pickedThumbnails,
      formData.artist,
      formData.song,
      formData.artistShort,
      formData.useCustomArtistShort,
    ],
  );

  const generatedOutput = useMemo(
    () => ({ ...pickedOutput, shortHooks, titles, thumbnails }),
    [pickedOutput, shortHooks, titles, thumbnails],
  );

  return {
    generatedOutput,
    handleRegenerate,
  };
}
