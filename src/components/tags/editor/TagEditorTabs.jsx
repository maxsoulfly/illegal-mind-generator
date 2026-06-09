const TAG_EDITOR_TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'titles', label: 'Titles' },
  { id: 'descriptions', label: 'Descriptions' },
  { id: 'shortHooks', label: 'Short Hooks' },
  { id: 'hashtags', label: 'Hashtags' },
];

export default function TagEditorTabs({ activeTab, onChangeTab }) {
  return (
    <div className="tag-editor-tabs">
      {TAG_EDITOR_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => onChangeTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
