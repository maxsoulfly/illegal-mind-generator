import { useCallback, useEffect, useState } from 'react';

import { apiDelete, apiGet, apiPost, apiPut } from '../utils/apiClient';

// Persistence migration Step 7: tag overrides now live in Postgres, reached
// through the local API (Vite proxies /api/* and attaches auth — see
// vite.config.js). First hook in the app to become async. localStorage is no
// longer read or written here; the old `tagOverrides` blob stays untouched as
// a fallback/reference until the migration's final cleanup step.
// See C:\Users\Max\.claude\plans\one-signal-many-terminals.md.

const EMPTY_OBJECT = {};

const overridesPath = (projectId) =>
  `/tag-overrides?project=${encodeURIComponent(projectId)}`;

export default function useTagOverrides(projectId) {
  // `result.projectId` is the project the loaded data belongs to. Deriving
  // `loading`/`projectOverrides` from a mismatch (instead of a separate
  // `loading` state set inside the effect) keeps the effect free of
  // synchronous setState — the project's react-hooks/set-state-in-effect rule
  // is an error, not a warning. A reload() for the *same* project keeps
  // `result.projectId` matching, so it's a silent background resync that never
  // blanks the UI; a project switch flips the mismatch and shows the gate.
  const [result, setResult] = useState({
    projectId: null,
    overrides: EMPTY_OBJECT,
    error: null,
  });

  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    apiGet(overridesPath(projectId))
      .then((data) => {
        if (!cancelled) {
          setResult({ projectId, overrides: data || EMPTY_OBJECT, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ projectId, overrides: EMPTY_OBJECT, error: err });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  const isCurrent = result.projectId === projectId;
  const projectOverrides = isCurrent ? result.overrides : EMPTY_OBJECT;
  const error = isCurrent ? result.error : null;
  const loading = !isCurrent;

  const getTagOverride = (tagName) => projectOverrides[tagName] || EMPTY_OBJECT;

  const updateTagOverride = useCallback(
    async (tagName, updates) => {
      // Optimistic shallow merge — mirrors the server PUT's semantics (scalar
      // COALESCE + jsonb `||`), so the happy path feels identical to the old
      // synchronous localStorage write.
      setResult((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [tagName]: { ...(prev.overrides[tagName] || {}), ...updates },
        },
      }));

      try {
        const { override } = await apiPut('/tag-overrides', {
          projectId,
          tagName,
          updates,
        });
        setResult((prev) => ({
          ...prev,
          overrides: { ...prev.overrides, [tagName]: override },
        }));
      } catch {
        // Silent resync — drops the optimistic change back to server truth.
        // If the server is genuinely down, the resync GET's own failure sets
        // `error` and App.jsx shows the retry screen.
        reload();
      }
    },
    [projectId, reload],
  );

  const resetTagOverride = useCallback(
    async (tagName) => {
      setResult((prev) => {
        const overrides = { ...prev.overrides };
        delete overrides[tagName];
        return { ...prev, overrides };
      });

      try {
        await apiDelete(
          `/tag-overrides/${encodeURIComponent(tagName)}?project=${encodeURIComponent(projectId)}`,
        );
      } catch {
        reload();
      }
    },
    [projectId, reload],
  );

  const syncProjectTags = useCallback(
    async ({ sourceProjectId, targetProjectId }) => {
      if (
        !sourceProjectId ||
        !targetProjectId ||
        sourceProjectId === targetProjectId
      ) {
        return;
      }

      // The server-side merge reads base tags from projects.json itself, so no
      // sourceBaseTags/targetBaseTags need passing. The write lands on
      // targetProjectId, a different project than this hook instance holds —
      // nothing to update locally; the target reads fresh on its next mount.
      await apiPost('/tag-overrides/sync', { sourceProjectId, targetProjectId });
    },
    [],
  );

  const copyTagFromProject = useCallback(
    async ({ tagName, sourceProjectId, targetProjectId }) => {
      if (
        !tagName ||
        !sourceProjectId ||
        !targetProjectId ||
        sourceProjectId === targetProjectId
      ) {
        return;
      }

      const { override } = await apiPost('/tag-overrides/copy-tag', {
        tagName,
        sourceProjectId,
        targetProjectId,
      });

      // copy-tag's target is the current project (see TagLibraryPage's
      // handleCopyTagFromProject), so reflect the merged result locally.
      if (targetProjectId === projectId) {
        setResult((prev) => ({
          ...prev,
          overrides: { ...prev.overrides, [tagName]: override },
        }));
      }
    },
    [projectId],
  );

  return {
    projectOverrides,
    loading,
    error,
    reload,
    getTagOverride,
    updateTagOverride,
    resetTagOverride,
    syncProjectTags,
    copyTagFromProject,
  };
}
