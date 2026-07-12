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

// Builds a paste-into-an-AI-chat prompt requesting release year + genre for
// a batch of songs. Clipboard-only, like buildSearchQuery above — this app
// is local-first/no-backend by design, so it never calls an AI itself.
export function buildMissingDataPrompt(entries) {
  const songList = entries
    .map(({ artist, song }) => `${artist} - ${song}`)
    .join('\n');

  return [
    "I'm missing the original release year and genre for these songs. For each one, reply with exactly one line in this format:",
    'Artist - Song: Year, Genre1, Genre2',
    '',
    "If you're not certain, give your best estimate.",
    '',
    'Songs:',
    songList,
  ].join('\n');
}

// Normalizes a name for matching an AI's response back to a saved entry —
// tolerates case, whitespace, and curly-vs-straight-quote differences
// (an AI reply commonly uses typographic apostrophes like "Won’t" even
// when the stored song title uses a plain one, or vice versa).
const normalizeForMatch = (value) =>
  (value || '')
    .toLowerCase()
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ');

// Parses one "Artist - Song: Year, Genre1, Genre2" line — the exact format
// buildMissingDataPrompt asks the AI to reply in. Returns null for any line
// that doesn't match (blank lines, the AI's own preamble/sign-off text,
// malformed rows), so callers can filter those into an "unmatched" list.
function parseResponseLine(line) {
  const colonIdx = line.indexOf(':');
  if (colonIdx === -1) return null;

  const namesPart = line.slice(0, colonIdx).trim();
  const dataPart = line.slice(colonIdx + 1).trim();

  const dashIdx = namesPart.indexOf(' - ');
  if (dashIdx === -1) return null;

  const artist = namesPart.slice(0, dashIdx).trim();
  const song = namesPart.slice(dashIdx + 3).trim();
  if (!artist || !song) return null;

  const dataMatch = dataPart.match(/^(\d{4})\s*,?\s*(.*)$/);
  if (!dataMatch) return null;

  const [, year, genre] = dataMatch;
  return { artist, song, year, genre: genre.trim() };
}

// Parses a pasted AI response and matches each line to a saved entry by
// artist+song. Deliberately does NOT decide what to overwrite — it just
// reports what it found; the caller (SavedLibrary.jsx) owns the
// non-destructive "only fill empty fields" policy, since that's a decision
// about existing entry data, not about parsing.
export function parseMissingDataResponse(text, savedEntries) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const matches = [];
  const unmatched = [];

  lines.forEach((line) => {
    const parsed = parseResponseLine(line);

    const entry = parsed
      ? savedEntries.find(
          (e) =>
            normalizeForMatch(e.artist) === normalizeForMatch(parsed.artist) &&
            normalizeForMatch(e.song) === normalizeForMatch(parsed.song),
        )
      : null;

    if (!parsed || !entry) {
      unmatched.push(line);
      return;
    }

    matches.push({
      entry,
      originalYear: parsed.year,
      originalGenre: parsed.genre,
    });
  });

  return { matches, unmatched };
}
