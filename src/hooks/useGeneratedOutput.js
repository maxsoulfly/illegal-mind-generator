import { useMemo, useRef, useState } from 'react';

import { pickDescriptions, renderDescriptions } from '../engine/descriptions/generateDescriptions';
import { pickShortDescriptions, renderShortDescriptions } from '../engine/descriptions/generateShortDescriptions';
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

    const pickedDescriptions = pickDescriptions(currentFormData, resolvedProjectConfig);
    const pickedShortDescriptions = pickShortDescriptions(currentFormData, resolvedProjectConfig);

    return {
      pickedShortHooks,
      pickedTitles,
      pickedThumbnails,
      pickedDescriptions,
      pickedShortDescriptions,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData
  }, [resolvedProjectConfig, generationSeed, formData.transformationTags, formData.entryLoadToken]);

  // RENDER phase: pure placeholder substitution against live formData — no
  // randomness, so it's safe (and the whole point) to re-run on every field
  // that feeds a placeholder, without re-picking which hooks/templates won.
  // This is what makes Titles/Thumbnails/Short Hooks/Descriptions reflect a
  // fresh Artist/Song/Artist Short/Signal Number/Genre edit (or a Story/Log/
  // CTA/custom-block override edit) immediately, while the actual selection
  // stays exactly as frozen by the PICK phase above.
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
      // {year} is now resolvable inside a tag's own title phrase (see
      // resolveTitleRecord.js) -- live-refresh on it like every other token
      // Titles already tracks.
      formData.originalYear,
    ],
  );

  const thumbnails = useMemo(
    () => renderThumbnails(pickedOutput.pickedThumbnails, formDataRef.current, resolvedProjectConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData; these deps just decide *when* to re-render, not what's read
    [
      pickedOutput.pickedThumbnails,
      resolvedProjectConfig,
      formData.artist,
      formData.song,
      formData.artistShort,
      formData.useCustomArtistShort,
      // {signalNumber}/{year} are now resolvable inside a tag's own thumbnail
      // phrase (see generateThumbnails.js) -- live-refresh on them too.
      formData.signalNumber,
      formData.originalYear,
    ],
  );

  // Descriptions additionally live-refresh on any song-override-text edit
  // (Story/Log/CTA/custom-block overrides, plus the legacy customStory/
  // customLogNote fields getEffectiveSongOverrides falls back to) — editing
  // one of these doesn't just fill a placeholder, it swaps which text shows
  // for that block entirely (see renderCustomBlock's live override check in
  // generateCustomBlocks.js). formData.songBlockOverrides is a new object
  // reference on every edit (setFormData always spreads), so depending on it
  // directly is sufficient — no need to stringify.
  const { longDescription, longDescriptionSegments, fileId } = useMemo(
    () => renderDescriptions(pickedOutput.pickedDescriptions, formDataRef.current, resolvedProjectConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData; these deps just decide *when* to re-render, not what's read
    [
      pickedOutput.pickedDescriptions,
      resolvedProjectConfig,
      formData.artist,
      formData.song,
      formData.artistShort,
      formData.useCustomArtistShort,
      formData.signalNumber,
      formData.songBlockOverrides,
      formData.customCta,
      formData.customStory,
      formData.customLogNote,
    ],
  );

  const { shortDescriptions, shortDescriptionSegments } = useMemo(
    () => renderShortDescriptions(pickedOutput.pickedShortDescriptions, formDataRef.current, resolvedProjectConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData; these deps just decide *when* to re-render, not what's read
    [
      pickedOutput.pickedShortDescriptions,
      resolvedProjectConfig,
      formData.artist,
      formData.song,
      formData.artistShort,
      formData.useCustomArtistShort,
      formData.signalNumber,
      formData.songBlockOverrides,
      formData.customCta,
      formData.customStory,
      formData.customLogNote,
    ],
  );

  // Hashtags/YouTube Tags have no internal randomness at all (no pooling, no
  // Math.random anywhere in generateHashtags.js) — every entry is a
  // deterministic function of formData/config, so there's nothing to
  // "freeze." It's computed directly as a live memo, not part of the PICK
  // phase above, keyed on the fields it actually reads.
  const { hashtags, youtubeTags } = useMemo(
    () => generateHashtags(formDataRef.current, resolvedProjectConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formDataRef.current is read intentionally instead of formData; these deps just decide *when* to recompute, not what's read
    [resolvedProjectConfig, formData.transformationTags, formData.artist, formData.song, formData.customHashtags],
  );

  const generatedOutput = useMemo(
    () => ({
      ...pickedOutput,
      shortHooks,
      titles,
      thumbnails,
      longDescription,
      longDescriptionSegments,
      fileId,
      shortDescriptions,
      shortDescriptionSegments,
      hashtags,
      youtubeTags,
    }),
    [pickedOutput, shortHooks, titles, thumbnails, longDescription, longDescriptionSegments, fileId, shortDescriptions, shortDescriptionSegments, hashtags, youtubeTags],
  );

  return {
    generatedOutput,
    handleRegenerate,
  };
}
