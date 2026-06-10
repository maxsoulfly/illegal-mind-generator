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
    const savedFormData = safeParse(localStorage.getItem('formData'), {});

    return {
      ...defaultFormData,
      ...savedFormData,
      ...(storage.generator.formData || {}),
    };
  });

  // Panel open/closed state across the app.
  const [panelVisibility, setPanelVisibility] = useState(() => {
    const storage = loadAppStorage();
    const saved = safeParse(localStorage.getItem('panelVisibility'), {});

    return {
      ...defaultPanelVisibility,
      ...saved,
      ...(storage.ui.panelVisibility || {}),
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

  // Persist generator form state.
  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));

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
    localStorage.setItem('panelVisibility', JSON.stringify(panelVisibility));

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
    localStorage.setItem('activePage', activePage);

    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        activePage,
      },
    }));
  }, [activePage]);

  // Persist selected project.
  useEffect(() => {
    localStorage.setItem('selectedProject', projectId);

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
  };
}
