const STORAGE_KEY = 'illegalMindGeneratorData';

export function buildAppBackup() {
  const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: storage,
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
  link.click();

  URL.revokeObjectURL(url);
}

export function restoreAppBackup(backup) {
  if (!backup?.data) {
    throw new Error('Invalid backup file.');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.data));
}
