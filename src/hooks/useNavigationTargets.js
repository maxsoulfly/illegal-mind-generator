import { useCallback, useEffect, useState } from 'react';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

// Click-to-navigate target state: each pair tracks "where a click should
// land" (e.g. a specific Hook Block card, a specific tag) so the receiving
// page can scroll to and highlight it. Every open*Search/openBlocksEditor
// function sets its own target AND navigates to that target's home page in
// the same handler — see useStaleTargetClearing.js for how these get
// cleared once the user leaves that page.
export default function useNavigationTargets(setActivePage, setPanelVisibility) {
  const [tagLibrarySearchTarget, setTagLibrarySearchTarget] = useState(null);
  const [shortHooksTarget, setShortHooksTarget] = useState(null);
  const [titlesTarget, setTitlesTarget] = useState(null);
  const [thumbnailsTarget, setThumbnailsTarget] = useState(null);
  const [hashtagsTarget, setHashtagsTarget] = useState(null);
  const [blocksTarget, setBlocksTarget] = useState(null);
  const [songOverrideTarget, setSongOverrideTarget] = useState(null);

  const [activeProjectSettingsSection, setActiveProjectSettingsSection] = useState(() => {
    const storage = loadAppStorage();
    return storage.ui.projectSettingsSection || 'general';
  });

  // Persist active Project Settings section.
  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        projectSettingsSection: activeProjectSettingsSection,
      },
    }));
  }, [activeProjectSettingsSection]);

  const openShortHooksSearch = (target) => {
    if (!target) return;
    setShortHooksTarget(target);
    setActivePage('projectSettings');
  };

  const clearShortHooksTarget = useCallback(() => {
    setShortHooksTarget(null);
  }, []);

  const openTitlesSearch = (target) => {
    if (!target) return;
    setTitlesTarget(target);
    setActivePage('projectSettings');
  };

  const clearTitlesTarget = useCallback(() => {
    setTitlesTarget(null);
  }, []);

  const openThumbnailsSearch = (target) => {
    if (!target) return;
    setThumbnailsTarget(target);
    setActivePage('projectSettings');
  };

  const clearThumbnailsTarget = useCallback(() => {
    setThumbnailsTarget(null);
  }, []);

  const openHashtagsSearch = (target) => {
    if (!target) return;
    setHashtagsTarget(target);
    setActivePage('projectSettings');
  };

  const clearHashtagsTarget = useCallback(() => {
    setHashtagsTarget(null);
  }, []);

  const openProjectSettings = useCallback((section) => {
    setActiveProjectSettingsSection(section);
    setActivePage('projectSettings');
  }, [setActiveProjectSettingsSection, setActivePage]);

  const openBlocksEditor = useCallback(({ subTab, blockKey, highlightText }) => {
    setBlocksTarget({ subTab, blockKey, highlightText });
    setActivePage('projectSettings');
  }, [setActivePage]);

  const clearBlocksTarget = useCallback(() => {
    setBlocksTarget(null);
  }, []);

  // Same-page target (Generator's own Advanced Options panel, not Project
  // Settings) — clicking a song-overridden description block scrolls to and
  // highlights the field you'd actually edit to change it. Every override
  // field lives inside the Input section's body, so a collapsed Input panel
  // must also force back open — not just Advanced Options — or the target
  // field never mounts to be scrolled to.
  const openSongOverride = useCallback(({ blockKey }) => {
    if (!blockKey) return;
    setSongOverrideTarget({ blockKey });
    setPanelVisibility((prev) =>
      prev.advanced && prev.input ? prev : { ...prev, advanced: true, input: true },
    );
  }, [setPanelVisibility]);

  const clearSongOverrideTarget = useCallback(() => {
    setSongOverrideTarget(null);
  }, []);

  const openTagLibrarySearch = (target) => {
    if (!target) return;

    const nextTarget =
      typeof target === 'string'
        ? {
            tagName: target,
          }
        : target;

    setTagLibrarySearchTarget(nextTarget);
    setActivePage('tags');
  };

  const clearTagLibrarySearchTarget = () => {
    setTagLibrarySearchTarget(null);
  };

  return {
    tagLibrarySearchTarget,
    openTagLibrarySearch,
    clearTagLibrarySearchTarget,
    shortHooksTarget,
    openShortHooksSearch,
    clearShortHooksTarget,
    titlesTarget,
    openTitlesSearch,
    clearTitlesTarget,
    thumbnailsTarget,
    openThumbnailsSearch,
    clearThumbnailsTarget,
    hashtagsTarget,
    openHashtagsSearch,
    clearHashtagsTarget,
    openProjectSettings,
    blocksTarget,
    openBlocksEditor,
    clearBlocksTarget,
    songOverrideTarget,
    openSongOverride,
    clearSongOverrideTarget,
    activeProjectSettingsSection,
    setActiveProjectSettingsSection,
  };
}
