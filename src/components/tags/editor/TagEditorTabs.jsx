import SubTabNav from '../../ui/SubTabNav';

const TAG_EDITOR_TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'titles', label: 'Titles' },
  { id: 'descriptions', label: 'Descriptions' },
  { id: 'shortHooks', label: 'Short Hooks' },
  { id: 'hashtags', label: 'Hashtags' },
];

export default function TagEditorTabs({ activeTab, onChangeTab }) {
  return (
    <SubTabNav tabs={TAG_EDITOR_TABS} activeTab={activeTab} onTabChange={onChangeTab} />
  );
}
