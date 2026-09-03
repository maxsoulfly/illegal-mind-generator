// Back-nav header shown at the top of every Level 2 / Level 3 screen inside a
// Tag card's drill-down (Tag -> Content overview -> Content type -> Pool
// editor). One component, reused by the flat-pool, Short Hook, and
// Description screens. `backLabel` names where the back button goes -- the
// tag itself from a Level 2 screen, the parent section from Level 3.
//
//   [<- Short Hooks]   DISCUSSION              3 phrases
export default function TagDrillHeader({ backLabel, title, subtitle, onBack }) {
  return (
    <div className="tag-drill-header">
      <button type="button" className="tag-drill-back" onClick={onBack}>
        ← {backLabel}
      </button>
      <span className="tag-drill-title">{title}</span>
      {subtitle != null && <span className="tag-drill-subtitle">{subtitle}</span>}
    </div>
  );
}
