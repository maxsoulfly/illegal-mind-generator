import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_PROJECT_KEY,
  defaultFormData,
} from '../constants/defaultFormData';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

const defaultPanelVisibility = {
  titles: true,
  thumbnails: true,
  descriptions: true,
  hashtags: true,
  hybridPrompt: true,
  advanced: false,
};

// Safely parse legacy localStorage values.
function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function useAppShellState() {
  // Generator form state.
  const [formData, setFormData] = useState(() => {
    const storage = loadAppStorage();
    const unified = storage.generator.formData;
    const legacy = Object.keys(unified || {}).length
      ? {}
      : safeParse(localStorage.getItem('formData'), {});

    return {
      ...defaultFormData,
      ...legacy,
      ...unified,
    };
  });

  // Panel open/closed state across the app.
  const [panelVisibility, setPanelVisibility] = useState(() => {
    const storage = loadAppStorage();
    const unified = storage.ui.panelVisibility;
    const legacy = Object.keys(unified || {}).length
      ? {}
      : safeParse(localStorage.getItem('panelVisibility'), {});

    return {
      ...defaultPanelVisibility,
      ...legacy,
      ...unified,
    };
  });

  // Titles panel display preference: render generated titles in uppercase.
  const [titleUppercase, setTitleUppercase] = useState(() => {
    const storage = loadAppStorage();
    return storage.ui.titleUppercase ?? false;
  });

  // Current page shown in the app menu.
  const [activePage, setActivePage] = useState(() => {
    const storage = loadAppStorage();

    return (
      storage.ui.activePage || localStorage.getItem('activePage') || 'generator'
    );
  });

  // Currently selected project.
  const [projectId, setProjectId] = useState(() => {
    const storage = loadAppStorage();

    return (
      storage.ui.selectedProject ||
      localStorage.getItem('selectedProject') ||
      DEFAULT_PROJECT_KEY
    );
  });
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

  // Persist generator form state.
  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      generator: {
        ...storage.generator,
        formData,
      },
    }));
  }, [formData]);

  // Persist panel visibility preferences.
  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        panelVisibility,
      },
    }));
  }, [panelVisibility]);

  // Persist title uppercase display preference.
  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        titleUppercase,
      },
    }));
  }, [titleUppercase]);

  // Persist active page selection.
  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        activePage,
      },
    }));
  }, [activePage]);

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

  // Persist selected project.
  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        selectedProject: projectId,
      },
    }));
  }, [projectId]);

  // Change project and keep form state in sync.
  const handleProjectChange = (nextProjectId) => {
    setProjectId(nextProjectId);

    setFormData((prev) => ({
      ...prev,
      project: nextProjectId,
    }));
  };

  // Toggle any collapsible panel by key.
  const togglePanel = (panelKey) => {
    setPanelVisibility((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }));
  };

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
  // highlights the field you'd actually edit to change it.
  const openSongOverride = useCallback(({ blockKey }) => {
    if (!blockKey) return;
    setSongOverrideTarget({ blockKey });
    setPanelVisibility((prev) => (prev.advanced ? prev : { ...prev, advanced: true }));
  }, []);

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

  // Reset generator form to defaults.
  const handleClearForm = () => {
    setFormData({ ...defaultFormData });
  };

  return {
    formData,
    setFormData,
    panelVisibility,
    setPanelVisibility,
    titleUppercase,
    setTitleUppercase,
    activePage,
    setActivePage,
    projectId,
    handleProjectChange,
    togglePanel,
    handleClearForm,
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
