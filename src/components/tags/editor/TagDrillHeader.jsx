// Back-nav header shown at the top of every Level 2 / Level 3 screen inside a
// Tag card's drill-down (Tag -> Content overview -> Content type -> Pool
// editor). One component, reused by the flat-pool, Short Hook, and
// Description screens.
//
//   [<- Faithful]   TITLES                 7 phrases
export default function TagDrillHeader({ label, title, subtitle, onBack }) {
  return (
    <div className="tag-drill-header">
      <button type="button" className="tag-drill-back" onClick={onBack}>
        ← {label}
      </button>
      <span className="tag-drill-title">{title}</span>
      {subtitle != null && <span className="tag-drill-subtitle">{subtitle}</span>}
    </div>
  );
}
