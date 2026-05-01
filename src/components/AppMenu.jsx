export default function AppMenu({ activePage, setActivePage }) {
  return (
    <nav className="app-menu">
      <button
        type="button"
        className={activePage === 'generator' ? 'active' : ''}
        onClick={() => setActivePage('generator')}
      >
        Generator
      </button>

      <button
        type="button"
        className={activePage === 'tags' ? 'active' : ''}
        onClick={() => setActivePage('tags')}
      >
        Tag Library
      </button>
    </nav>
  );
}
