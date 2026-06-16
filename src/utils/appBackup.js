const STORAGE_KEY = 'illegalMindGeneratorData';

// These features still persist to their own standalone legacy keys instead
// of the unified storage object, so the backup has to capture them directly.
const LEGACY_KEYS = [
  'savedEntries',
  'shortsQueueByProject',
  'tagOverrides',
  'tagVisibilityOverrides',
];

function readLegacyData() {
  return LEGACY_KEYS.reduce((acc, key) => {
    const raw = localStorage.getItem(key);

    if (raw !== null) acc[key] = JSON.parse(raw);

    return acc;
  }, {});
}

export function buildAppBackup() {
  const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    data: storage,
    legacy: readLegacyData(),
  };
}

export function downloadAppBackup() {
  const backup = buildAppBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `illegal-mind-generator-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function restoreAppBackup(backup) {
  if (!backup?.data) {
    throw new Error('Invalid backup file.');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.data));

  LEGACY_KEYS.forEach((key) => {
    if (backup.legacy?.[key] !== undefined) {
      localStorage.setItem(key, JSON.stringify(backup.legacy[key]));
    }
  });
}
