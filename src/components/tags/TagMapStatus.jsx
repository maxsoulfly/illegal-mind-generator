export default function TagMapStatus({ existsIn }) {
  return (
    <div className="tag-map-status">
      <span className={existsIn.title ? 'mapped' : 'missing'}>
        Title: {existsIn.title ? '✓' : '—'}
      </span>

      <span className={existsIn.thumbnail ? 'mapped' : 'missing'}>
        Thumbnail: {existsIn.thumbnail ? '✓' : '—'}
      </span>

      <span className={existsIn.description ? 'mapped' : 'missing'}>
        Description: {existsIn.description ? '✓' : '—'}
      </span>
    </div>
  );
}
