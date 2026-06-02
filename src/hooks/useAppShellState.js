import { useEffect, useState } from 'react';

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

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function useAppShellState() {
  const [formData, setFormData] = useState(() => {
    const storage = loadAppStorage();
    const savedFormData = safeParse(localStorage.getItem('formData'), {});

    return {
      ...defaultFormData,
      ...savedFormData,
      ...(storage.generator.formData || {}),
    };
  });

  const [panelVisibility, setPanelVisibility] = useState(() => {
    const storage = loadAppStorage();
    const saved = safeParse(localStorage.getItem('panelVisibility'), {});

    return {
      ...defaultPanelVisibility,
      ...saved,
      ...(storage.ui.panelVisibility || {}),
    };
  });

  const [activePage, setActivePage] = useState(() => {
    const storage = loadAppStorage();

    return (
      storage.ui.activePage || localStorage.getItem('activePage') || 'generator'
    );
  });

  const [projectId, setProjectId] = useState(() => {
    const storage = loadAppStorage();

    return (
      storage.ui.selectedProject ||
      localStorage.getItem('selectedProject') ||
      DEFAULT_PROJECT_KEY
    );
  });

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

  const handleProjectChange = (nextProjectId) => {
    setProjectId(nextProjectId);

    setFormData((prev) => ({
      ...prev,
      project: nextProjectId,
    }));
  };

  const togglePanel = (panelKey) => {
    setPanelVisibility((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }));
  };

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
  };
}
