import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_PROJECT_KEY,
  defaultFormData,
} from '../constants/defaultFormData';

import { loadAppStorage, updateAppStorage } from '../utils/storage';

const defaultPanelVisibility = {
  titles: true,
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
  const [blocksTarget, setBlocksTarget] = useState(null);

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

  const openBlocksEditor = useCallback(({ subTab, blockKey }) => {
    setBlocksTarget({ subTab, blockKey });
  }, []);

  const clearBlocksTarget = useCallback(() => {
    setBlocksTarget(null);
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
    blocksTarget,
    openBlocksEditor,
    clearBlocksTarget,
    activeProjectSettingsSection,
    setActiveProjectSettingsSection,
  };
}
