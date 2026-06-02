import QueueSettings from '../input/QueueSettings';

export default function EntrySettings({ entry, onUpdateEntry }) {
  return (
    <div className="entry-settings">
      <QueueSettings
        excludeFromRandomizer={entry.excludeFromRandomizer || false}
        onToggle={(excludeFromRandomizer) =>
          onUpdateEntry(entry.id, {
            excludeFromRandomizer,
          })
        }
      />
    </div>
  );
}
