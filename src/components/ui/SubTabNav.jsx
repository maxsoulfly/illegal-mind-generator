export default function SubTabNav({ tabs, activeTab, onTabChange, className }) {
  return (
    <nav className={`subtab-nav${className ? ` ${className}` : ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
