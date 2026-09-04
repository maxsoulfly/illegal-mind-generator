import { useEffect, useState } from 'react';

import {
  DEFAULT_PROJECT_KEY,
  defaultFormData,
} from '../constants/defaultFormData';

import { loadAppStorage, updateAppStorage } from '../utils/storage';
import useNavigationTargets from './useNavigationTargets';

const defaultPanelVisibility = {
  input: true,
  titles: true,
  thumbnails: true,
  descriptions: true,
  hashtags: true,
  hybridPrompt: true,
  advanced: false,
  coverHooks: false,
};

// Safely parse legacy localStorage values.
function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// `navigate` (react-router-dom's useNavigate(), from App.jsx) is threaded
// straight through to useNavigationTargets — this hook has no page-selection
// state of its own. The URL is the only source of truth for the top-level
// page; see App.jsx for how activePage is derived from it.
export default function useAppShellState(navigate) {
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

  // Currently selected project.
  const [projectId, setProjectId] = useState(() => {
    const storage = loadAppStorage();

    return (
      storage.ui.selectedProject ||
      localStorage.getItem('selectedProject') ||
      DEFAULT_PROJECT_KEY
    );
  });
  const navigationTargets = useNavigationTargets(navigate, setPanelVisibility);

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

  // Reset generator form to defaults.
  const handleClearForm = () => {
    setFormData((prev) => ({
      ...defaultFormData,
      entryLoadToken: (prev.entryLoadToken || 0) + 1,
    }));
  };

  return {
    formData,
    setFormData,
    panelVisibility,
    setPanelVisibility,
    titleUppercase,
    setTitleUppercase,
    projectId,
    handleProjectChange,
    togglePanel,
    handleClearForm,
    ...navigationTargets,
  };
}
