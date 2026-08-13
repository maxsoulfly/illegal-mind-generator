import { normalizeForMatch } from './searchQuery';

// Clipboard-only, like buildMissingDataPrompt/buildTagPrompt — this app never
// calls an AI itself. The user screenshots their YouTube Studio "Content"
// list (Shorts and Videos are separate tabs, hence one videoType per paste
// batch), feeds it to an external AI along with this prompt, and pastes the
// reply back into CalendarImportPanel.
//
// Extraction instructions branch on videoType because real YouTube Studio
// data shows the Artist/Song pair lives in different places per tab: Shorts
// titles are stylized hooks/questions with the real source only named in the
// grey description underneath; long-form titles usually already contain the
// Artist/Song pair directly.
const SHORTS_INSTRUCTIONS = [
  'The bold video title is often a stylized hook or question and does NOT name the real song — the actual Artist/Song pair is in the smaller grey description snippet underneath the title. Look there, not the title.',
  '',
  'The description names the source in one of a few patterns:',
  '- "Artist - Song (...)" — e.g. "The Offspring - Defy You (modernized Cover by Maxx Dee)..." → Artist: The Offspring, Song: Defy You',
  '- "Song by Artist // ..." — e.g. "Girl\'s Not Grey by AFI // One-Man Band Cover..." → Artist: AFI, Song: Girl\'s Not Grey',
  '- "Song // Cover by Artist" — e.g. "I Won\'t Lie Down // Cover by Face to Face..." → Artist: Face to Face, Song: I Won\'t Lie Down',
  '',
  "Occasionally neither the title nor the visible description names the artist directly — check the hashtags near the end of the description too (e.g. a hashtag like #Мельница can be the only place the original artist is named).",
].join('\n');

const LONG_INSTRUCTIONS = [
  'The Artist/Song pair is usually right in the bold video title itself, e.g.:',
  '- "Rammstein – Sonne (What If It Was Punk?)" → Artist: Rammstein, Song: Sonne',
  '- "Way Away by Yellowcard // Full Band Cover" → Artist: Yellowcard, Song: Way Away',
  '- "Face to Face – I Won\'t Lie Down (An Underrated Punk Classic?)" → Artist: Face to Face, Song: I Won\'t Lie Down',
  '',
  "If the title doesn't make the source clear, check the grey description snippet underneath it instead.",
].join('\n');

export function buildCalendarImportPrompt(videoType) {
  const tabLabel = videoType === 'short' ? 'Shorts' : 'Videos (long-form)';
  const instructions = videoType === 'short' ? SHORTS_INSTRUCTIONS : LONG_INSTRUCTIONS;

  return [
    `I'm looking at a screenshot of my YouTube Studio "Content" list — the ${tabLabel} tab. Each row is a cover song I've uploaded (or scheduled to upload).`,
    '',
    instructions,
    '',
    'Convert the Date column to ISO format (YYYY-MM-DD).',
    '',
    'For each row, reply with exactly one line in this format:',
    'YYYY-MM-DD | Artist | Song',
    '',
    "If a row is an original composition or otherwise has no identifiable cover source, reply instead with:",
    'SKIP | YYYY-MM-DD | short reason',
    '',
    "Don't include a header row, blank lines between entries, or any other commentary — one line per video, nothing else.",
  ].join('\n');
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Parses one line of the exact format buildCalendarImportPrompt asks the AI
// to reply in. Returns null for anything that doesn't match — malformed
// rows, stray commentary, blank lines — so the caller can bucket those into
// "unrecognized" rather than silently dropping them.
function parseCalendarImportLine(line) {
  const parts = line.split('|').map((part) => part.trim());

  if (parts[0]?.toUpperCase() === 'SKIP') {
    if (parts.length < 2 || !ISO_DATE_RE.test(parts[1])) return null;
    return { type: 'skip', isoDate: parts[1], reason: parts.slice(2).join(' | ') };
  }

  if (parts.length !== 3) return null;

  const [isoDate, artist, song] = parts;
  if (!ISO_DATE_RE.test(isoDate) || !artist || !song) return null;

  return { type: 'match', isoDate, artist, song };
}

// Below this length a fallback match (song-title or artist-only) is too
// likely to be a false positive (e.g. a one-word title matching many
// unrelated songs, or a two-letter artist abbreviation) to be worth
// surfacing at all.
const MIN_FUZZY_MATCH_LENGTH = 3;

function songTitleMatches(normalizedA, normalizedB) {
  if (!normalizedA || !normalizedB) return false;
  if (normalizedA === normalizedB) return true;
  return normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA);
}

// Not part of buildCalendarImportPrompt's requested format — the AI
// sometimes improvises this itself when it can identify the artist from a
// hashtag/description but genuinely can't read a stylized title. Treated as
// "no title" rather than a real (very matchable) search string: past the
// MIN_FUZZY_MATCH_LENGTH gate it would otherwise happily substring-match
// almost any short saved song title, and since the song-title tier runs
// before the artist-only tier and returns as soon as it finds anything, a
// spurious substring hit here would silently consume the match and the
// artist fallback below would never get a chance to run.
const UNKNOWN_SONG_PLACEHOLDER = 'unknown';

// Parses a pasted AI response and matches each line to a saved entry by
// artist+song. Deliberately does NOT decide what to write to the calendar —
// same separation of concerns as parseMissingDataResponse/parseTagResponse:
// this just reports what it found, CalendarImportPanel owns the "always
// overwrite" policy for the actual calendar writes.
//
// A line whose artist+song don't match exactly falls back through two
// tiers, in order: (1) a song-title-only search (exact or partial, e.g. a
// translated/transliterated artist name like "t.A.T.u." vs "ТАТУ" — same
// song, different artist spelling), skipped entirely when the song is the
// "Unknown" placeholder (see above); (2) if that finds nothing — including
// the "Unknown" case — an exact artist-name match, so a known artist with
// real saved entries still surfaces candidates instead of the song title
// alone silently dead-ending the whole line. Either tier's candidates go to
// needsConfirmation rather than being auto-applied like an exact match,
// since both are inherently uncertain — CalendarImportPanel surfaces these
// for the user to pick from (or reject), same non-silent-guessing principle
// as every other bucket.
export function parseCalendarImportResponse(text, savedEntries) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const matches = [];
  const needsConfirmation = [];
  const unmatched = [];
  const skipped = [];
  const unrecognized = [];

  lines.forEach((line) => {
    const parsed = parseCalendarImportLine(line);

    if (!parsed) {
      unrecognized.push(line);
      return;
    }

    if (parsed.type === 'skip') {
      skipped.push({ isoDate: parsed.isoDate, reason: parsed.reason, raw: line });
      return;
    }

    const exactEntry = savedEntries.find(
      (e) =>
        normalizeForMatch(e.artist) === normalizeForMatch(parsed.artist) &&
        normalizeForMatch(e.song) === normalizeForMatch(parsed.song),
    );

    if (exactEntry) {
      matches.push({ isoDate: parsed.isoDate, entry: exactEntry, raw: line });
      return;
    }

    const normalizedParsedSong = normalizeForMatch(parsed.song);
    const songIsUnknown = normalizedParsedSong === UNKNOWN_SONG_PLACEHOLDER;
    const songCandidates =
      !songIsUnknown && normalizedParsedSong.length >= MIN_FUZZY_MATCH_LENGTH
        ? savedEntries.filter((e) => songTitleMatches(normalizeForMatch(e.song), normalizedParsedSong))
        : [];

    if (songCandidates.length > 0) {
      needsConfirmation.push({
        isoDate: parsed.isoDate,
        artist: parsed.artist,
        song: parsed.song,
        raw: line,
        candidates: songCandidates,
      });
      return;
    }

    const normalizedParsedArtist = normalizeForMatch(parsed.artist);
    const artistCandidates =
      normalizedParsedArtist.length >= MIN_FUZZY_MATCH_LENGTH
        ? savedEntries.filter((e) => normalizeForMatch(e.artist) === normalizedParsedArtist)
        : [];

    if (artistCandidates.length > 0) {
      needsConfirmation.push({
        isoDate: parsed.isoDate,
        artist: parsed.artist,
        song: parsed.song,
        raw: line,
        candidates: artistCandidates,
      });
      return;
    }

    unmatched.push(line);
  });

  return { matches, needsConfirmation, unmatched, skipped, unrecognized };
}
