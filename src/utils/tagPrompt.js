// Builds a paste-into-an-AI-chat prompt requesting a full set of phrase
// pools for a brand-new transformation tag, and parses the AI's reply back
// into the exact shape updateTagOverride expects. Same build-prompt/
// parse-response pairing as searchQuery.js's missing-data round-trip, but
// for tag creation instead of saved-song metadata — this app is
// local-first/no-backend by design, so it never calls an AI itself.

const SECTION_FIELD_MAP = {
  TITLE: 'title',
  THUMBNAIL: 'thumbnail',
  DESCRIPTION_TECHNICAL: 'description.technical',
  DESCRIPTION_LOG: 'description.log',
  DESCRIPTION_STATUS: 'description.status',
  HASHTAGS: 'hashtags',
};

export function buildTagPrompt(label, category, shortHookTypes = {}) {
  const hookTypeEntries = Object.entries(shortHookTypes);

  const lines = [
    `I'm adding a new content tag called "${label}"${category ? ` (category: ${category})` : ''} to a YouTube cover-song generator. For each section below, reply with that exact section header on its own line, followed by one phrase per line (4-6 phrases per section). Skip a section entirely (omit the header) if it genuinely doesn't apply — don't invent filler.`,
    '',
    `Every phrase must be SPECIFIC to "${label}" — reference its actual sonic/genre traits (instrumentation, production choices, vocal style, song structure, scene culture) so the phrase wouldn't make sense reused for a different genre tag. Reject anything generic enough to apply to any style — e.g. "More emotion. Same song.", "Pure ${label} energy.", "Heavier heart", "Sing it loud" are all too vague, since they name no actual trait of ${label}. Every phrase should read as something only a fan of ${label} specifically would say.`,
    '',
    `Short Hooks (the SHORTHOOKS_* sections) are read aloud as complete short-form video hook sentences, and are also mixed directly into video titles — they need real substance, not vague mood words. Each SHORTHOOKS_* section below shows 1-2 real examples already used in this app for that exact angle — match BOTH the theme AND the placeholder pattern of those examples (some angles are about the song, e.g. {artist}/{song}; others are about your own growth as a musician, e.g. {years} — follow whichever the examples show, don't force {artist}/{song} where it doesn't fit). At least 4 of the 6 phrases per section should use a placeholder in that section's own style. TITLE/THUMBNAIL/DESCRIPTION_* phrases don't need placeholders.`,
    '',
    'TITLE:',
    `(short title-suffix phrases naming this specific style, e.g. "${label} Rework")`,
    '',
    'THUMBNAIL:',
    `(short punchy thumbnail text naming this specific style, all caps works well, e.g. "${label.toUpperCase()}")`,
    '',
    'DESCRIPTION_TECHNICAL:',
    `(short technical-sounding lines naming what actually changes musically for ${label}, e.g. "Arrangement: rebuilt around breakdowns and gang vocals.")`,
    '',
    'DESCRIPTION_LOG:',
    `(short "log entry" style lines describing what was done, specific to ${label})`,
    '',
    'DESCRIPTION_STATUS:',
    '(short status-report style lines, e.g. "Deviation: Significant.")',
    '',
    'HASHTAGS:',
    '(one hashtag word per line, no # prefix, no spaces)',
    '',
  ];

  hookTypeEntries.forEach(([key, hookType]) => {
    const examples = (hookType?.templates || []).slice(0, 2);
    lines.push(`SHORTHOOKS_${key.toUpperCase()}:`);
    lines.push(
      examples.length > 0
        ? `(angle: ${hookType?.label || key} — match this theme and placeholder pattern: ${examples.map((e) => `"${e}"`).join(' / ')})`
        : `(short-form video hook angle: ${hookType?.label || key})`,
    );
    lines.push('');
  });

  return lines.join('\n').trimEnd();
}

const normalizeHeader = (line) => {
  const match = line.trim().match(/^([A-Za-z_]+):\s*$/);
  return match ? match[1].toUpperCase() : null;
};

function getFieldArray(result, path) {
  return path.split('.').reduce((acc, key) => acc[key], result);
}

export function parseTagResponse(text, shortHookTypes = {}) {
  const result = {
    title: [],
    thumbnail: [],
    description: { technical: [], log: [], status: [] },
    hashtags: [],
    shortHooks: {},
    unrecognized: [],
  };

  const validHookKeys = new Set(Object.keys(shortHookTypes).map((k) => k.toUpperCase()));

  const lines = (text || '').split('\n').map((line) => line.trim());

  let currentSection = null;

  lines.forEach((line) => {
    if (!line) return;

    const header = normalizeHeader(line);
    if (header) {
      if (SECTION_FIELD_MAP[header]) {
        currentSection = { type: 'field', path: SECTION_FIELD_MAP[header] };
      } else if (header.startsWith('SHORTHOOKS_') && validHookKeys.has(header.slice('SHORTHOOKS_'.length))) {
        currentSection = { type: 'hook', key: header.slice('SHORTHOOKS_'.length).toLowerCase() };
      } else {
        currentSection = null;
        result.unrecognized.push(line);
      }
      return;
    }

    // A stray "(...)" hint line left in place by the user pasting the
    // prompt's own placeholder text back — skip, not real content.
    if (line.startsWith('(') && line.endsWith(')')) return;

    if (!currentSection) {
      result.unrecognized.push(line);
      return;
    }

    if (currentSection.type === 'field') {
      if (currentSection.path === 'hashtags') {
        line.split(',').map((part) => part.trim().replace(/^#/, '')).filter(Boolean)
          .forEach((tag) => result.hashtags.push(tag));
      } else {
        getFieldArray(result, currentSection.path).push(line);
      }
    } else if (currentSection.type === 'hook') {
      if (!result.shortHooks[currentSection.key]) result.shortHooks[currentSection.key] = [];
      result.shortHooks[currentSection.key].push(line);
    }
  });

  return result;
}
