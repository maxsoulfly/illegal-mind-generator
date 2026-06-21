import { downloadAppBackup, restoreAppBackup } from '../utils/appBackup';

export default function AppBackupControls() {
  const handleImportBackup = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);

        restoreAppBackup(backup);

        alert('Backup imported. Reloading...');

        setTimeout(() => {
          window.location.reload();
        }, 300);
      } catch {
        alert('Invalid backup file.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="app-backup-controls">
      <h3>Backup</h3>
      <p className="tag-summary">
        Export all app data — saved entries, tags, queues, and settings — as a
        single JSON file. Import to restore from a backup.
      </p>
      <div className="button-row">
        <button
          type="button"
          className="button-secondary"
          onClick={downloadAppBackup}
        >
          Export
        </button>

        <label className="button-secondary app-backup-import" role="button">
          Import
          <input
            hidden
            type="file"
            accept=".json"
            onChange={handleImportBackup}
          />
        </label>
      </div>
    </div>
  );
}
