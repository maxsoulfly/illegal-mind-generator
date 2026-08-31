import { useCallback, useEffect, useState } from 'react';

import { apiDelete, apiGet, apiPatch, apiPut } from '../utils/apiClient';

// Persistence migration Step 8: project settings overrides now live in
// Postgres, reached through the local API (Vite proxies /api/* and attaches
// auth — see vite.config.js). Second hook to become async, same shape as
// useTagOverrides. localStorage is no longer read or written here; the old
// `projectOverrides` blob stays untouched as a fallback/reference until the
// migration's final cleanup step.
// See C:\Users\Max\.claude\plans\one-signal-many-terminals.md.

const EMPTY_OBJECT = {};

const settingsPath = (projectId) =>
  `/project-overrides?project=${encodeURIComponent(projectId)}`;

export default function useProjectOverrides(projectId) {
  // `result.projectId` is the project the loaded settings belong to. Deriving
  // `loading` from a mismatch (rather than a `loading` state set inside the
  // effect) keeps the effect free of synchronous setState. A reload() for the
  // same project keeps the id matching → silent background resync; a project
  // switch flips the mismatch → the App load gate shows.
  const [result, setResult] = useState({
    projectId: null,
    settings: EMPTY_OBJECT,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    apiGet(settingsPath(projectId))
      .then((data) => {
        if (!cancelled) {
          setResult({ projectId, settings: data || EMPTY_OBJECT, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ projectId, settings: EMPTY_OBJECT, error: err });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  const isCurrent = result.projectId === projectId;
  const projectSettingsOverrides = isCurrent ? result.settings : EMPTY_OBJECT;
  const error = isCurrent ? result.error : null;
  const loading = !isCurrent;

  const updateProjectOverride = useCallback(
    async (updates) => {
      // Optimistic top-level shallow merge — mirrors the server PATCH's jsonb
      // `||` (a top-level key is replaced wholesale, not deep-merged), so the
      // happy path feels identical to the old synchronous localStorage write.
      setResult((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
      }));

      try {
        const { settings } = await apiPatch('/project-overrides', {
          projectId,
          updates,
        });
        setResult((prev) => ({ ...prev, settings }));
      } catch {
        // Silent resync — drops the optimistic change back to server truth.
        reload();
      }
    },
    [projectId, reload],
  );

  const resetProjectOverride = useCallback(
    async (fieldName) => {
      setResult((prev) => {
        const settings = { ...prev.settings };
        delete settings[fieldName];
        return { ...prev, settings };
      });

      try {
        await apiDelete(
          `/project-overrides/${encodeURIComponent(fieldName)}?project=${encodeURIComponent(projectId)}`,
        );
      } catch {
        reload();
      }
    },
    [projectId, reload],
  );

  const syncHookTypesToProject = useCallback(
    async (targetProjectId, hookTypes) => {
      if (!targetProjectId) return;

      const { settings } = await apiPut('/project-overrides/short-hook-types', {
        targetProjectId,
        hookTypes,
      });

      // The write lands on targetProjectId — normally a different project than
      // this hook instance holds (the Short Hooks tab's "sync to" dropdown),
      // so there's nothing to update locally. Reflect it only in the edge case
      // where it targets the current project.
      if (targetProjectId === projectId) {
        setResult((prev) => ({ ...prev, settings }));
      }
    },
    [projectId],
  );

  return {
    projectSettingsOverrides,
    loading,
    error,
    reload,
    updateProjectOverride,
    resetProjectOverride,
    syncHookTypesToProject,
  };
}
