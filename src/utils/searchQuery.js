// Builds a Google-search-ready string for looking up missing song metadata
// (release date / original genre) by hand. Shared by the Generator form's
// empty-field double-click and the Saved Library's missing-data badges so
// the query format can't drift between the two surfaces.
export function buildSearchQuery(kind, artist, song) {
  const a = artist?.trim();
  const s = song?.trim();
  if (!a || !s) return '';

  return kind === 'genre' ? `${a} - ${s} genre` : `${a} - ${s} release date`;
}
