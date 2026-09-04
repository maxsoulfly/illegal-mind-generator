import { useEffect, useState } from 'react';

import SavedLibrary from '../components/savedLibrary/SavedLibrary';
import InputForm from '../components/InputForm';
import GeneratorResultsPanel from '../components/generator/GeneratorResultsPanel';
import { updateAppStorage } from '../utils/storage';
import { useUploadCalendar } from '../hooks/useUploadCalendar';
import { buildEntryId } from '../utils/savedEntries';
import { formatDayLabel } from '../utils/calendarDates';

// Unified storage applies a default for ui.showSavedLibrary, so a plain
// loadAppStorage() read can't tell "never set" apart from "explicitly false".
// Read the raw stored JSON instead to check whether it was actually written.
function readRawUnifiedUi() {
  try {
    return JSON.parse(localStorage.getItem('illegalMindGeneratorData'))?.ui;
  } catch {
    return undefined;
  }
}

export default function GeneratorPage({
  formData,
  setFormData,
  projectId,
  projects,
  projectConfig,
  generatedOutput,
  savedEntries,
  panelVisibility,
  togglePanel,
  titleUppercase,
  onToggleTitleUppercase,
  tagUsage,
  handleRegenerate,
  handleSaveEntry,
  handleClearForm,
  handleLoadEntry,
  handleDeleteEntry,
  handleExportEntries,
  handleImportEntries,
  handleUpdateEntry,
  setPanelVisibility,
  projectOverrides,
  projectSettingsOverrides,
  onOpenSourceTag,
  onOpenSourceHook,
  onOpenSourceTemplate,
  onOpenSourceThumbnail,
  onOpenSourceHashtag,
  onOpenBlocksEditor,
  onNavigateToSettings,
  songOverrideTarget,
  openSongOverride,
  clearSongOverrideTarget,
  coverHookTarget,
  openCoverHook,
  clearCoverHookTarget,
  onOpenTodoSearch,
  showToast,
}) {
  const [inputFlash, setInputFlash] = useState(false);

  const calendar = useUploadCalendar(projectId, savedEntries, projectConfig.uploadSchedule);
  const currentEntryId = buildEntryId(formData.artist || '', formData.song || '');
  const isCurrentEntrySaved = savedEntries.some((entry) => entry.id === currentEntryId);

  // Cover-Specific Hooks auto-persist. Unlike the rest of the Input form
  // (explicit SAVE only), a hook add / bulk / delete / edit-blur writes
  // straight through — but ONLY for an already-saved entry, as a
  // column-scoped PATCH (`handleUpdateEntry`) that leaves every other,
  // possibly-dirty, form field untouched. For an unsaved song this is a
  // no-op: the hooks stay in formData and ride along on the next explicit
  // SAVE (which is when the record is first created). `CoverShortHooksEditor`
  // still calls setFormData on every change, so formData.coverShortHooks
  // stays authoritative and a later SAVE can't revert it.
  const persistCoverHooks = (nextHooks) => {
    if (isCurrentEntrySaved) {
      handleUpdateEntry(currentEntryId, { coverShortHooks: nextHooks });
    }
  };

  // Toast the outcome of an explicit SAVE — only after persistence settles,
  // never on click. handleSaveEntry returns true/false/null (see
  // useSavedEntries.js); null = no artist/song, nothing attempted, no toast.
  const handleSaveWithFeedback = async (targetProjectId) => {
    const outcome = await handleSaveEntry(targetProjectId);
    if (outcome === true) showToast('Song saved');
    else if (outcome === false) showToast('Save failed');
  };

  const handleAddToCalendar = () => {
    const videoType = formData.videoType === 'Shorts' ? 'short' : 'long';
    const target = calendar.addToNextOpenSlot(currentEntryId, videoType);

    if (!target) {
      showToast(`No open ${videoType === 'short' ? 'Short' : 'Long'} slot found in the next 90 days.`);
      return;
    }

    showToast(`Added to calendar: ${formatDayLabel(target.isoDate)}`);
  };

  // Resolve whether to mix shorts hooks into long title candidates.
  // formData.useHooksForLongTitles acts as a per-session override of the
  // project config default (projectConfig.title.useHooksForLongTitles).
  const useHooksForLongTitles =
    formData.useHooksForLongTitles ?? projectConfig.title?.useHooksForLongTitles ?? false;

  const handleToggleHooksForLongTitles = () => {
    setFormData((prev) => ({
      ...prev,
      useHooksForLongTitles: !useHooksForLongTitles,
    }));
  };

  const [showSavedLibrary, setShowSavedLibrary] = useState(() => {
    const ui = readRawUnifiedUi();

    if (typeof ui?.showSavedLibrary === 'boolean') {
      return ui.showSavedLibrary;
    }

    const saved = localStorage.getItem('showSavedLibrary');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    updateAppStorage((storage) => ({
      ...storage,
      ui: {
        ...storage.ui,
        showSavedLibrary,
      },
    }));
  }, [showSavedLibrary]);

  const handleLoadEntryFromLibrary = (entry) => {
    handleLoadEntry(entry);

    setShowSavedLibrary(false);

    setInputFlash(true);

    window.setTimeout(() => {
      setInputFlash(false);
    }, 700);
  };
  return (
    <>
      <SavedLibrary
        savedEntries={savedEntries}
        onLoadEntry={handleLoadEntryFromLibrary}
        onDeleteEntry={handleDeleteEntry}
        onExportEntries={handleExportEntries}
        onImportEntries={handleImportEntries}
        onUpdateEntry={handleUpdateEntry}
        projectConfig={projectConfig}
        showSavedLibrary={showSavedLibrary}
        setShowSavedLibrary={setShowSavedLibrary}
        onOpenTodoSearch={onOpenTodoSearch}
      />

      <div className="layout-grid">
        <div className={`panel ${inputFlash ? 'panel-flash-success' : ''}`}>
          <InputForm
            projectId={projectId}
            projects={projects}
            formData={formData}
            setFormData={setFormData}
            onClear={handleClearForm}
            projectConfig={projectConfig}
            onSaveEntry={handleSaveWithFeedback}
            savedEntries={savedEntries}
            onLoadEntry={handleLoadEntry}
            onDeleteEntry={handleDeleteEntry}
            onExportEntries={handleExportEntries}
            onImportEntries={handleImportEntries}
            tagUsage={tagUsage}
            panelVisibility={panelVisibility}
            togglePanel={togglePanel}
            projectOverrides={projectOverrides}
            songOverrideTarget={songOverrideTarget}
            clearSongOverrideTarget={clearSongOverrideTarget}
            coverHookTarget={coverHookTarget}
            clearCoverHookTarget={clearCoverHookTarget}
            onPersistCoverHooks={persistCoverHooks}
            onOpenSourceTag={onOpenSourceTag}
            onAddToCalendar={handleAddToCalendar}
            canAddToCalendar={isCurrentEntrySaved}
          />
        </div>
        <GeneratorResultsPanel
          projectConfig={projectConfig}
          projectSettingsOverrides={projectSettingsOverrides}
          generatedOutput={generatedOutput}
          formData={formData}
          panelVisibility={panelVisibility}
          setPanelVisibility={setPanelVisibility}
          onOpenSourceTag={onOpenSourceTag}
          onOpenSourceHook={onOpenSourceHook}
          onOpenSourceTemplate={onOpenSourceTemplate}
          onOpenSourceThumbnail={onOpenSourceThumbnail}
          onOpenSourceHashtag={onOpenSourceHashtag}
          onOpenBlocksEditor={onOpenBlocksEditor}
          onNavigateToSettings={onNavigateToSettings}
          onOpenSongOverride={openSongOverride}
          onOpenCoverHook={openCoverHook}
          useHooksForLongTitles={useHooksForLongTitles}
          onToggleHooksForLongTitles={handleToggleHooksForLongTitles}
          titleUppercase={titleUppercase}
          onToggleTitleUppercase={onToggleTitleUppercase}
        />
      </div>
    </>
  );
}
