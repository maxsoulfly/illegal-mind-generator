import { useEffect, useRef } from 'react';

// Every open*Search/openBlocksEditor/openTagLibrarySearch function sets its
// own *Target state AND navigates to that target's home page in the same
// handler. Clears only fire when the user has genuinely left a target's page
// (via the main AppHeader nav, or by loading a saved entry) — without this,
// a clicked link's highlight/expanded state stays stuck until a refresh,
// since ProjectSettingsPage's handleSectionChange only covers switching
// tabs *within* Project Settings, not leaving the page entirely.
//
// activePage is now derived from the router's location (App.jsx's
// pageIdFromPath(useLocation().pathname) — see the routing refactor), not a
// same-component useState like the *Target values still are. Those two
// updates are NOT guaranteed to land in the same React commit even though
// every open*Search call triggers them synchronously together — confirmed
// live: navigate() calling a target-driven page change produces one extra
// intermediate render where activePage still reads the *old* page while the
// target has already been set. Without the guard below, this effect (which
// re-runs on ANY dependency change, including the target just being set)
// would see "activePage doesn't match this target's home page yet" on that
// one extra render and immediately clear the target it was just handed —
// before the location ever catches up. The fix: only run the actual
// clearing logic when activePage has genuinely changed since the last time
// this effect ran, not merely because some other dependency (a target)
// changed while activePage happens to still be mid-transition.
export default function useStaleTargetClearing({
  activePage,
  shortHooksTarget, clearShortHooksTarget,
  titlesTarget, clearTitlesTarget,
  thumbnailsTarget, clearThumbnailsTarget,
  hashtagsTarget, clearHashtagsTarget,
  blocksTarget, clearBlocksTarget,
  tagLibrarySearchTarget, clearTagLibrarySearchTarget,
  songOverrideTarget, clearSongOverrideTarget,
  coverHookTarget, clearCoverHookTarget,
  todoTarget, clearTodoTarget,
}) {
  const prevActivePageRef = useRef(activePage);

  useEffect(() => {
    const activePageChanged = prevActivePageRef.current !== activePage;
    prevActivePageRef.current = activePage;
    if (!activePageChanged) return;

    if (activePage !== 'projectSettings') {
      if (shortHooksTarget) clearShortHooksTarget();
      if (titlesTarget) clearTitlesTarget();
      if (thumbnailsTarget) clearThumbnailsTarget();
      if (hashtagsTarget) clearHashtagsTarget();
      if (blocksTarget) clearBlocksTarget();
    }
    if (activePage !== 'tags' && tagLibrarySearchTarget) {
      clearTagLibrarySearchTarget();
    }
    if (activePage !== 'generator') {
      if (songOverrideTarget) clearSongOverrideTarget();
      if (coverHookTarget) clearCoverHookTarget();
    }
    if (activePage !== 'todo' && todoTarget) {
      clearTodoTarget();
    }
  }, [
    activePage,
    shortHooksTarget, clearShortHooksTarget,
    titlesTarget, clearTitlesTarget,
    thumbnailsTarget, clearThumbnailsTarget,
    hashtagsTarget, clearHashtagsTarget,
    blocksTarget, clearBlocksTarget,
    tagLibrarySearchTarget, clearTagLibrarySearchTarget,
    songOverrideTarget, clearSongOverrideTarget,
    coverHookTarget, clearCoverHookTarget,
    todoTarget, clearTodoTarget,
  ]);
}
