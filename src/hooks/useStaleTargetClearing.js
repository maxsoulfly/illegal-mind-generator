import { useEffect } from 'react';

// Every open*Search/openBlocksEditor/openTagLibrarySearch function sets its
// own *Target state AND navigates to that target's home page in the same
// handler, so by the time this effect runs after a target-driven nav,
// activePage already matches and the group below is correctly skipped.
// Clears only fire when the user has genuinely left a target's page (via
// the main AppHeader nav, or by loading a saved entry) — without this, a
// clicked link's highlight/expanded state stays stuck until a refresh,
// since ProjectSettingsPage's handleSectionChange only covers switching
// tabs *within* Project Settings, not leaving the page entirely.
export default function useStaleTargetClearing({
  activePage,
  shortHooksTarget, clearShortHooksTarget,
  titlesTarget, clearTitlesTarget,
  thumbnailsTarget, clearThumbnailsTarget,
  hashtagsTarget, clearHashtagsTarget,
  blocksTarget, clearBlocksTarget,
  tagLibrarySearchTarget, clearTagLibrarySearchTarget,
  songOverrideTarget, clearSongOverrideTarget,
  todoTarget, clearTodoTarget,
}) {
  useEffect(() => {
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
    if (activePage !== 'generator' && songOverrideTarget) {
      clearSongOverrideTarget();
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
    todoTarget, clearTodoTarget,
  ]);
}
